package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wms/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public Result<Page<InventoryBatch>> list(@RequestParam(defaultValue = "1") long current,
                                             @RequestParam(defaultValue = "10") long size,
                                             @RequestParam(required = false) Long warehouseId,
                                             @RequestParam(required = false) Long productId) {
        Page<InventoryBatch> page = new Page<>(current, size);
        LambdaQueryWrapper<InventoryBatch> wrapper = new LambdaQueryWrapper<>();
        if (warehouseId != null) wrapper.eq(InventoryBatch::getWarehouseId, warehouseId);
        if (productId != null) wrapper.eq(InventoryBatch::getProductId, productId);
        wrapper.orderByAsc(InventoryBatch::getInboundDate);
        return Result.ok(inventoryService.page(page, wrapper));
    }

    @PostMapping("/inbound")
    public Result<Boolean> inbound(@RequestParam Long warehouseId, 
                                   @RequestParam Long locationId, 
                                   @RequestParam Long productId, 
                                   @RequestParam int quantity, 
                                   @RequestParam java.math.BigDecimal unitCost) {
        inventoryService.inbound(warehouseId, locationId, productId, quantity, unitCost);
        return Result.ok(true);
    }
}
