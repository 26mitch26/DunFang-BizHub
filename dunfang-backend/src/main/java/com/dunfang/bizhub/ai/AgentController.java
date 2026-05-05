package com.dunfang.bizhub.ai;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dunfang.bizhub.common.Result;
import com.dunfang.bizhub.crm.FollowUp;
import com.dunfang.bizhub.crm.FollowUpMapper;
import com.dunfang.bizhub.finance.FinanceInvoice;
import com.dunfang.bizhub.finance.FinanceInvoiceMapper;
import com.dunfang.bizhub.sales.SalesOrder;
import com.dunfang.bizhub.sales.SalesOrderMapper;
import com.dunfang.bizhub.wms.InventoryBatch;
import com.dunfang.bizhub.wms.InventoryBatchMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AgentController {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SalesOrderMapper salesOrderMapper;
    private final InventoryBatchMapper inventoryBatchMapper;
    private final FinanceInvoiceMapper invoiceMapper;
    private final FollowUpMapper followUpMapper;

    @Value("${ai-worker.url}")
    private String aiWorkerBaseUrl;

    @Value("${ai-worker.api-key:${DASHSCOPE_API_KEY:}}")
    private String serverApiKey;

    @PostMapping("/agent/chat")
    public Result<Map<String, String>> chat(@RequestBody AgentRequest request,
                                            @RequestHeader(value = "X-DashScope-Api-Key", required = false) String apiKey) {
        String effectiveKey = (apiKey != null && !apiKey.isEmpty()) ? apiKey : serverApiKey;
        if (effectiveKey == null || effectiveKey.isEmpty()) {
            return Result.fail(400, "请配置 DashScope API Key（在 .env 中设置 DASHSCOPE_API_KEY）");
        }

        try {
            Map<String, Object> context = buildBusinessContext();

            Map<String, Object> body = new HashMap<>();
            body.put("question", request.getQuestion());
            body.put("context", context);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-DashScope-Api-Key", effectiveKey);

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiWorkerBaseUrl + "/api/v1/ai/agent/chat", httpEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Result.fail(500, "AI Worker 返回异常");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.path("code").asInt() != 200) {
                return Result.fail(500, "AI 分析失败: " + root.path("message").asText());
            }

            String answer = root.path("data").path("answer").asText();
            Map<String, String> result = new HashMap<>();
            result.put("answer", answer);
            return Result.ok(result);

        } catch (Exception e) {
            log.error("AI Agent chat failed: {}", e.getMessage(), e);
            return Result.fail(500, "AI 助手暂时不可用: " + e.getMessage());
        }
    }

    private Map<String, Object> buildBusinessContext() {
        Map<String, Object> context = new HashMap<>();

        Map<String, Object> summary = new HashMap<>();
        List<SalesOrder> todayOrders = salesOrderMapper.selectList(null);
        summary.put("totalOrderCount", todayOrders.size());
        summary.put("totalOrderAmount", todayOrders.stream()
                .map(SalesOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));

        long draftCount = todayOrders.stream().filter(o -> "DRAFT".equals(o.getStatus())).count();
        long confirmedCount = todayOrders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        long shippedCount = todayOrders.stream().filter(o -> "SHIPPED".equals(o.getStatus())).count();
        long completedCount = todayOrders.stream().filter(o -> "COMPLETED".equals(o.getStatus())).count();
        summary.put("draftOrderCount", draftCount);
        summary.put("confirmedOrderCount", confirmedCount);
        summary.put("shippedOrderCount", shippedCount);
        summary.put("completedOrderCount", completedCount);

        List<FinanceInvoice> unmatchedInvoices = invoiceMapper.selectList(
                new LambdaQueryWrapper<FinanceInvoice>().eq(FinanceInvoice::getStatus, "UNMATCHED"));
        summary.put("unmatchedInvoiceCount", unmatchedInvoices.size());

        List<FollowUp> pendingFollowUps = followUpMapper.selectList(
                new LambdaQueryWrapper<FollowUp>()
                        .isNotNull(FollowUp::getNextFollowDate)
                        .le(FollowUp::getNextFollowDate, java.time.LocalDateTime.now()));
        summary.put("pendingFollowUpCount", pendingFollowUps.size());

        context.put("summary", summary);

        List<InventoryBatch> batches = inventoryBatchMapper.selectList(null);
        Map<Long, Integer> availableByProduct = new HashMap<>();
        for (InventoryBatch b : batches) {
            availableByProduct.merge(b.getProductId(), b.getQuantity() - b.getLockedQuantity(), Integer::sum);
        }
        List<Map<String, Object>> lowStock = new ArrayList<>();
        availableByProduct.entrySet().stream()
                .filter(e -> e.getValue() < 10)
                .sorted(Comparator.comparingInt(Map.Entry::getValue))
                .forEach(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", e.getKey());
                    item.put("available", e.getValue());
                    lowStock.add(item);
                });
        context.put("lowStockItems", lowStock);

        List<Map<String, Object>> orderSummaries = new ArrayList<>();
        todayOrders.stream().limit(10).forEach(o -> {
            Map<String, Object> item = new HashMap<>();
            item.put("orderNo", o.getOrderNo());
            item.put("customerId", o.getCustomerId());
            item.put("totalAmount", o.getTotalAmount());
            item.put("status", o.getStatus());
            orderSummaries.add(item);
        });
        context.put("orders", orderSummaries);

        return context;
    }
}
