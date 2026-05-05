package com.dunfang.bizhub.finance;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dunfang.bizhub.customer.Customer;
import com.dunfang.bizhub.customer.CustomerMapper;
import com.dunfang.bizhub.sales.SalesOrder;
import com.dunfang.bizhub.sales.SalesOrderMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class InvoiceService extends ServiceImpl<FinanceInvoiceMapper, FinanceInvoice> {

    private static final BigDecimal AMOUNT_TOLERANCE = new BigDecimal("5.00");
    private static final BigDecimal AMOUNT_EXACT_MATCH = new BigDecimal("0.01");
    private static final int MAX_MATCH_DAYS = 90;
    private static final double MATCH_THRESHOLD = 0.55;
    private static final int MAX_RETRY = 2;

    private final RestTemplate restTemplate;
    private final SalesOrderMapper salesOrderMapper;
    private final CustomerMapper customerMapper;
    private final ObjectMapper objectMapper;
    private final String aiWorkerUrl;

    @Value("${ai-worker.api-key:${DASHSCOPE_API_KEY:}}")
    private String serverApiKey;

    @Value("${ai-worker.timeout.connect:10000}")
    private int connectTimeout;

    @Value("${ai-worker.timeout.read:60000}")
    private int readTimeout;

    public InvoiceService(RestTemplate restTemplate, SalesOrderMapper salesOrderMapper,
                          CustomerMapper customerMapper,
                          ObjectMapper objectMapper,
                          @Value("${ai-worker.url}") String aiWorkerBaseUrl) {
        this.restTemplate = restTemplate;
        this.salesOrderMapper = salesOrderMapper;
        this.customerMapper = customerMapper;
        this.objectMapper = objectMapper;
        this.aiWorkerUrl = aiWorkerBaseUrl + "/api/v1/ai/parse-invoice";
    }

    @Transactional
    public FinanceInvoice parseAndReconcile(MultipartFile file, String apiKey) throws Exception {
        JsonNode data = callAiWorkerWithRetry(file, apiKey);

        FinanceInvoice invoice = buildInvoiceFromAiData(data);

        matchInvoiceWithOrders(invoice);

        this.save(invoice);
        return invoice;
    }

    private JsonNode callAiWorkerWithRetry(MultipartFile file, String apiKey) throws Exception {
        String effectiveKey = (apiKey != null && !apiKey.isEmpty()) ? apiKey : serverApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        if (effectiveKey != null && !effectiveKey.isEmpty()) {
            headers.set("X-DashScope-Api-Key", effectiveKey);
        }

        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        Exception lastException = null;
        for (int attempt = 0; attempt <= MAX_RETRY; attempt++) {
            try {
                if (attempt > 0) {
                    log.warn("Retrying AI Worker call, attempt {}/{}", attempt, MAX_RETRY);
                    Thread.sleep(1000L * attempt);
                }

                log.info("Calling AI Worker (attempt {})", attempt + 1);
                ResponseEntity<String> response = restTemplate.postForEntity(aiWorkerUrl, requestEntity, String.class);

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new RuntimeException("AI Worker returned non-2xx status: " + response.getStatusCode());
                }

                JsonNode root = objectMapper.readTree(response.getBody());
                int code = root.path("code").asInt();
                if (code != 200) {
                    throw new RuntimeException("AI Worker error: " + root.path("message").asText());
                }

                return root.path("data");
            } catch (RestClientException e) {
                lastException = e;
                log.error("AI Worker call failed (attempt {}): {}", attempt + 1, e.getMessage());
            }
        }

        throw new RuntimeException("AI Worker failed after " + (MAX_RETRY + 1) + " attempts", lastException);
    }

    private FinanceInvoice buildInvoiceFromAiData(JsonNode data) {
        FinanceInvoice invoice = new FinanceInvoice();
        invoice.setInvoiceNo(data.path("invoiceNumber").asText());

        String dateStr = data.path("invoiceDate").asText();
        try {
            if (dateStr != null && !dateStr.isEmpty() && !"null".equals(dateStr)) {
                invoice.setInvoiceDate(LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE));
            }
        } catch (Exception e) {
            log.warn("Failed to parse invoice date: {}", dateStr);
        }

        invoice.setBuyerName(data.path("buyerName").asText());
        invoice.setBuyerTaxId(data.path("buyerTaxId").asText());
        invoice.setSellerName(data.path("sellerName").asText());
        invoice.setTotalAmount(new BigDecimal(data.path("totalAmount").asText("0")));
        invoice.setTaxAmount(new BigDecimal(data.path("taxAmount").asText("0")));
        invoice.setItemsJson(data.path("items").toString());
        invoice.setStatus("UNMATCHED");

        return invoice;
    }

    private void matchInvoiceWithOrders(FinanceInvoice invoice) {
        List<SalesOrder> candidates = salesOrderMapper.selectList(
                new LambdaQueryWrapper<SalesOrder>()
                        .in(SalesOrder::getStatus, "CONFIRMED", "SHIPPED"));

        if (candidates.isEmpty()) {
            log.info("No candidate orders for invoice {}", invoice.getInvoiceNo());
            return;
        }

        List<MatchScore> scoredCandidates = new ArrayList<>();
        for (SalesOrder order : candidates) {
            double score = calculateMatchScore(invoice, order);
            if (score >= MATCH_THRESHOLD) {
                scoredCandidates.add(new MatchScore(order, score));
            }
        }

        if (scoredCandidates.isEmpty()) {
            log.info("No order matched invoice {} (threshold={})", invoice.getInvoiceNo(), MATCH_THRESHOLD);
            return;
        }

        scoredCandidates.sort(Comparator.comparingDouble(MatchScore::score).reversed());
        MatchScore best = scoredCandidates.get(0);

        log.info("Matched invoice {} with order {} (score={})", invoice.getInvoiceNo(), best.order().getId(), best.score());
        invoice.setMatchedOrderId(best.order().getId());
        invoice.setStatus("MATCHED");
    }

    private double calculateMatchScore(FinanceInvoice invoice, SalesOrder order) {
        double amountScore = scoreAmount(invoice.getTotalAmount(), order.getTotalAmount());
        double dateScore = scoreDateProximity(invoice.getInvoiceDate(), order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate() : null);

        String orderCustomerName = null;
        if (order.getCustomerId() != null) {
            Customer customer = customerMapper.selectById(order.getCustomerId());
            if (customer != null) {
                orderCustomerName = customer.getName();
            }
        }
        double nameScore = scoreBuyerName(invoice.getBuyerName(), orderCustomerName);

        return amountScore * 0.50 + dateScore * 0.25 + nameScore * 0.25;
    }

    private double scoreAmount(BigDecimal invoiceAmt, BigDecimal orderAmt) {
        if (invoiceAmt == null || orderAmt == null) return 0;

        BigDecimal diff = invoiceAmt.subtract(orderAmt).abs();
        if (diff.compareTo(AMOUNT_EXACT_MATCH) <= 0) return 1.0;
        if (diff.compareTo(AMOUNT_TOLERANCE) <= 0) {
            return 1.0 - diff.divide(AMOUNT_TOLERANCE, 4, RoundingMode.HALF_UP).doubleValue();
        }

        BigDecimal maxLenient = orderAmt.multiply(new BigDecimal("0.10")).max(new BigDecimal("50"));
        if (diff.compareTo(maxLenient) <= 0) {
            return 0.3 * (1.0 - diff.divide(maxLenient, 4, RoundingMode.HALF_UP).doubleValue());
        }

        return 0;
    }

    private double scoreDateProximity(LocalDate invoiceDate, LocalDate orderDate) {
        if (invoiceDate == null || orderDate == null) return 0.5;

        long daysBetween = Math.abs(ChronoUnit.DAYS.between(invoiceDate, orderDate));
        if (daysBetween == 0) return 1.0;
        if (daysBetween <= 7) return 0.9;
        if (daysBetween <= 30) return 0.7;
        if (daysBetween <= MAX_MATCH_DAYS) return 0.4;
        return 0;
    }

    private double scoreBuyerName(String invoiceBuyer, String orderCustomer) {
        if (invoiceBuyer == null || invoiceBuyer.isEmpty() || orderCustomer == null || orderCustomer.isEmpty()) {
            return 0.5;
        }

        String a = invoiceBuyer.replaceAll("[\\s\\p{Punct}]", "").toLowerCase();
        String b = orderCustomer.replaceAll("[\\s\\p{Punct}]", "").toLowerCase();

        if (a.equals(b)) return 1.0;
        if (a.contains(b) || b.contains(a)) return 0.8;

        int lcsLen = lcsLength(a, b);
        double ratio = (2.0 * lcsLen) / (a.length() + b.length());
        return ratio > 0.4 ? ratio : 0;
    }

    private int lcsLength(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[m][n];
    }

    private record MatchScore(SalesOrder order, double score) {}
}
