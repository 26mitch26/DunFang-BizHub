package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wms/warehouses")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @GetMapping
    public Result<Page<Warehouse>> list(@RequestParam(defaultValue = "1") long current,
                                        @RequestParam(defaultValue = "10") long size,
                                        @RequestParam(required = false) String name) {
        Page<Warehouse> page = new Page<>(current, size);
        LambdaQueryWrapper<Warehouse> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(Warehouse::getName, name);
        }
        return Result.ok(warehouseService.page(page, wrapper));
    }

    @PostMapping
    public Result<Boolean> add(@RequestBody Warehouse warehouse) {
        return Result.ok(warehouseService.save(warehouse));
    }

    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        warehouse.setId(id);
        return Result.ok(warehouseService.updateById(warehouse));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.ok(warehouseService.removeById(id));
    }
}
