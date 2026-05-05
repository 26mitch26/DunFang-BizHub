package com.dunfang.bizhub.commission;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dunfang.bizhub.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commissions")
@RequiredArgsConstructor
public class CommissionController {

    private final CommissionService commissionService;

    // --- Rules ---

    @GetMapping("/rules")
    public Result<IPage<CommissionRule>> pageRules(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long brandId) {
        return Result.ok(commissionService.pageRules(current, size, brandId));
    }

    @PostMapping("/rules")
    public Result<CommissionRule> createRule(@RequestBody CommissionRule rule) {
        return Result.ok(commissionService.createRule(rule));
    }

    @PutMapping("/rules/{id}")
    public Result<CommissionRule> updateRule(@PathVariable Long id, @RequestBody CommissionRule rule) {
        return Result.ok(commissionService.updateRule(id, rule));
    }

    @DeleteMapping("/rules/{id}")
    public Result<Void> deleteRule(@PathVariable Long id) {
        commissionService.deleteRule(id);
        return Result.ok();
    }

    // --- Records ---

    @GetMapping("/records")
    public Result<IPage<CommissionRecord>> pageRecords(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long orderId) {
        return Result.ok(commissionService.pageRecords(current, size, orderId));
    }

    @GetMapping("/records/order/{orderId}")
    public Result<List<CommissionRecord>> getRecordsByOrder(@PathVariable Long orderId) {
        return Result.ok(commissionService.getRecordsByOrderId(orderId));
    }
}
