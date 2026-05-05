package com.dunfang.bizhub.controller;

import com.dunfang.bizhub.common.Result;
import com.dunfang.bizhub.finance.FinanceInvoice;
import com.dunfang.bizhub.finance.FinanceInvoiceMapper;
import com.dunfang.bizhub.crm.FollowUp;
import com.dunfang.bizhub.crm.FollowUpMapper;
import com.dunfang.bizhub.sales.SalesOrder;
import com.dunfang.bizhub.sales.SalesOrderMapper;
import com.dunfang.bizhub.wms.InventoryBatch;
import com.dunfang.bizhub.wms.InventoryBatchMapper;
import com.dunfang.bizhub.wms.Product;
import com.dunfang.bizhub.wms.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SalesOrderMapper salesOrderMapper;
    private final InventoryBatchMapper inventoryBatchMapper;
    private final FinanceInvoiceMapper invoiceMapper;
    private final FollowUpMapper followUpMapper;
    private final ProductMapper productMapper;

    @GetMapping("/summary")
    public Result<Map<String, Object>> summary() {
        Map<String, Object> data = new HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();

        List<SalesOrder> todayOrders = salesOrderMapper.selectList(
                new LambdaQueryWrapper<SalesOrder>()
                        .ge(SalesOrder::getCreatedAt, todayStart));
        BigDecimal todayAmount = todayOrders.stream()
                .map(SalesOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        data.put("todayOrderCount", todayOrders.size());
        data.put("todayOrderAmount", todayAmount);

        List<SalesOrder> allOrders = salesOrderMapper.selectList(null);
        long draftCount = allOrders.stream().filter(o -> "DRAFT".equals(o.getStatus())).count();
        long confirmedCount = allOrders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        data.put("draftOrderCount", draftCount);
        data.put("confirmedOrderCount", confirmedCount);
        data.put("totalOrderCount", allOrders.size());

        List<FinanceInvoice> unmatchedInvoices = invoiceMapper.selectList(
                new LambdaQueryWrapper<FinanceInvoice>()
                        .eq(FinanceInvoice::getStatus, "UNMATCHED"));
        List<FinanceInvoice> matchedInvoices = invoiceMapper.selectList(
                new LambdaQueryWrapper<FinanceInvoice>()
                        .eq(FinanceInvoice::getStatus, "MATCHED"));
        data.put("unmatchedInvoiceCount", unmatchedInvoices.size());
        data.put("matchedInvoiceCount", matchedInvoices.size());

        List<FollowUp> pendingFollowUps = followUpMapper.selectList(
                new LambdaQueryWrapper<FollowUp>()
                        .isNotNull(FollowUp::getNextFollowDate)
                        .le(FollowUp::getNextFollowDate, LocalDateTime.now()));
        data.put("pendingFollowUpCount", pendingFollowUps.size());

        List<InventoryBatch> allBatches = inventoryBatchMapper.selectList(null);
        long lowStockCount = allBatches.stream()
                .filter(b -> (b.getQuantity() - b.getLockedQuantity()) < 5)
                .count();
        data.put("lowStockItemCount", lowStockCount);

        return Result.ok(data);
    }

    @GetMapping("/sales-trend")
    public Result<List<Map<String, Object>>> salesTrend() {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(29);

        List<SalesOrder> orders = salesOrderMapper.selectList(
                new LambdaQueryWrapper<SalesOrder>()
                        .ge(SalesOrder::getCreatedAt, startDate.atStartOfDay())
                        .in(SalesOrder::getStatus, "CONFIRMED", "SHIPPED", "COMPLETED"));

        Map<String, BigDecimal> dailyAmount = orders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getTotalAmount() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate().toString(),
                        Collectors.reducing(BigDecimal.ZERO, SalesOrder::getTotalAmount, BigDecimal::add)));

        Map<String, Long> dailyCount = orders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate().toString(),
                        Collectors.counting()));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            String dateStr = startDate.plusDays(i).toString();
            Map<String, Object> item = new HashMap<>();
            item.put("date", dateStr);
            item.put("amount", dailyAmount.getOrDefault(dateStr, BigDecimal.ZERO));
            item.put("count", dailyCount.getOrDefault(dateStr, 0L));
            trend.add(item);
        }

        return Result.ok(trend);
    }

    @GetMapping("/low-stock")
    public Result<List<Map<String, Object>>> lowStock() {
        List<InventoryBatch> batches = inventoryBatchMapper.selectList(null);

        Map<Long, Integer> availableByProduct = new HashMap<>();
        Map<Long, Long> warehouseByProduct = new HashMap<>();
        for (InventoryBatch b : batches) {
            long pid = b.getProductId();
            int available = b.getQuantity() - b.getLockedQuantity();
            availableByProduct.merge(pid, available, Integer::sum);
            warehouseByProduct.putIfAbsent(pid, b.getWarehouseId());
        }

        List<Map<String, Object>> lowStockItems = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : availableByProduct.entrySet()) {
            if (entry.getValue() < 10) {
                Product product = productMapper.selectById(entry.getKey());
                Map<String, Object> item = new HashMap<>();
                item.put("productId", entry.getKey());
                item.put("productName", product != null ? product.getName() : "Unknown");
                item.put("skuCode", product != null ? product.getSkuCode() : "-");
                item.put("available", entry.getValue());
                item.put("warehouseId", warehouseByProduct.get(entry.getKey()));
                lowStockItems.add(item);
            }
        }

        lowStockItems.sort(Comparator.comparingInt(a -> (Integer) a.get("available")));
        return Result.ok(lowStockItems);
    }

    @GetMapping("/pending-follow-ups")
    public Result<List<FollowUp>> pendingFollowUps() {
        List<FollowUp> list = followUpMapper.selectList(
                new LambdaQueryWrapper<FollowUp>()
                        .isNotNull(FollowUp::getNextFollowDate)
                        .le(FollowUp::getNextFollowDate, LocalDateTime.now())
                        .orderByAsc(FollowUp::getNextFollowDate)
                        .last("LIMIT 10"));
        return Result.ok(list);
    }
}
