package com.dunfang.bizhub.sales;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService orderService;

    @GetMapping
    public Result<IPage<SalesOrder>> page(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status) {
        return Result.ok(orderService.page(current, size, companyId, customerId, status));
    }

    @GetMapping("/{id}")
    public Result<SalesOrder> getById(@PathVariable Long id) {
        return Result.ok(orderService.getById(id));
    }

    @GetMapping("/{id}/items")
    public Result<List<SalesOrderItem>> getItems(@PathVariable Long id) {
        return Result.ok(orderService.getItems(id));
    }

    @PostMapping
    public Result<SalesOrder> create(@RequestBody CreateOrderRequest request) {
        return Result.ok(orderService.create(request.getOrder(), request.getItems()));
    }

    @PostMapping("/{id}/confirm")
    public Result<SalesOrder> confirm(@PathVariable Long id) {
        return Result.ok(orderService.confirm(id));
    }

    @PutMapping("/{id}")
    public Result<SalesOrder> update(@PathVariable Long id, @RequestBody SalesOrder order) {
        return Result.ok(orderService.update(id, order));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return Result.ok();
    }
}
