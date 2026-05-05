package com.dunfang.bizhub.finance;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dunfang.bizhub.sales.SalesOrder;
import com.dunfang.bizhub.sales.SalesOrderMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService extends ServiceImpl<FinanceInvoiceMapper, FinanceInvoice> {

    private final RestTemplate restTemplate;
    private final SalesOrderMapper salesOrderMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public FinanceInvoice parseAndReconcile(MultipartFile file, String apiKey) throws Exception {
        // 1. 调用 Python AI Worker
        String aiWorkerUrl = "http://localhost:8001/api/v1/ai/parse-invoice";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-DashScope-Api-Key", apiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileAsResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", fileAsResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        log.info("Sending request to Python AI Worker...");
        ResponseEntity<String> response = restTemplate.postForEntity(aiWorkerUrl, requestEntity, String.class);
        
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("AI Worker failed to process invoice");
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        if (root.path("code").asInt() != 200) {
            throw new RuntimeException("AI Worker returned error: " + root.path("message").asText());
        }

        JsonNode data = root.path("data");

        // 2. 解析结构化数据
        FinanceInvoice invoice = new FinanceInvoice();
        invoice.setInvoiceNo(data.path("invoiceNumber").asText());
        
        String dateStr = data.path("invoiceDate").asText();
        try {
            if (dateStr != null && !dateStr.isEmpty() && !dateStr.equals("null")) {
                invoice.setInvoiceDate(LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")));
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

        // 3. 智能对账算法 (MVP: 根据总金额误差 1 元以内匹配)
        // 查找状态为 CONFIRMED (已确认) 的订单
        LambdaQueryWrapper<SalesOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.eq(SalesOrder::getStatus, "CONFIRMED");
        List<SalesOrder> confirmedOrders = salesOrderMapper.selectList(orderWrapper);

        for (SalesOrder order : confirmedOrders) {
            BigDecimal orderAmount = order.getTotalAmount();
            BigDecimal diff = orderAmount.subtract(invoice.getTotalAmount()).abs();
            // 如果误差小于等于 1 元
            if (diff.compareTo(BigDecimal.ONE) <= 0) {
                log.info("Matched invoice {} with order {} based on amount {}", invoice.getInvoiceNo(), order.getId(), orderAmount);
                invoice.setMatchedOrderId(order.getId());
                invoice.setStatus("MATCHED");
                
                // 这里可以进一步将 Order 状态更新为 INVOICED 或进入下一环节
                // order.setStatus("INVOICED");
                // salesOrderMapper.updateById(order);
                break;
            }
        }

        // 4. 落库
        this.save(invoice);
        return invoice;
    }
}
