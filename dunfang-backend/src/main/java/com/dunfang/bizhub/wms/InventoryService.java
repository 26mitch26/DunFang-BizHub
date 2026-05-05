package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dunfang.bizhub.common.BizException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class InventoryService extends ServiceImpl<InventoryBatchMapper, InventoryBatch> {

    /**
     * 入库操作 (新建批次)
     */
    @Transactional(rollbackFor = Exception.class)
    public void inbound(Long warehouseId, Long locationId, Long productId, int quantity, java.math.BigDecimal unitCost) {
        InventoryBatch batch = new InventoryBatch();
        batch.setWarehouseId(warehouseId);
        batch.setLocationId(locationId);
        batch.setProductId(productId);
        batch.setBatchNo("IN-" + LocalDate.now().toString().replace("-", "") + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        batch.setInboundDate(LocalDate.now());
        batch.setUnitCost(unitCost);
        batch.setQuantity(quantity);
        batch.setLockedQuantity(0);
        this.save(batch);
    }

    /**
     * 锁定库存 (预扣减)
     */
    @Transactional(rollbackFor = Exception.class)
    public void lockInventory(Long warehouseId, Long productId, int quantityToLock) {
        // 先进先出排序：按入库时间升序找批次
        List<InventoryBatch> batches = this.list(new LambdaQueryWrapper<InventoryBatch>()
                .eq(InventoryBatch::getWarehouseId, warehouseId)
                .eq(InventoryBatch::getProductId, productId)
                .apply("quantity - locked_quantity > 0")
                .orderByAsc(InventoryBatch::getInboundDate));

        int remainingToLock = quantityToLock;

        for (InventoryBatch batch : batches) {
            if (remainingToLock <= 0) break;

            int availableInBatch = batch.getQuantity() - batch.getLockedQuantity();
            int lockAmount = Math.min(availableInBatch, remainingToLock);

            int updated = this.baseMapper.lockQuantity(batch.getId(), lockAmount);
            if (updated > 0) {
                remainingToLock -= lockAmount;
            }
        }

        if (remainingToLock > 0) {
            throw new BizException(400, "库存不足，无法锁定所需的 " + quantityToLock + " 个单位");
        }
    }

    /**
     * 实际出库 (扣减已锁定的库存)
     */
    @Transactional(rollbackFor = Exception.class)
    public void deductLockedInventory(Long warehouseId, Long productId, int quantityToDeduct) {
        // 按先进先出排序找已锁定库存大于0的批次
        List<InventoryBatch> batches = this.list(new LambdaQueryWrapper<InventoryBatch>()
                .eq(InventoryBatch::getWarehouseId, warehouseId)
                .eq(InventoryBatch::getProductId, productId)
                .gt(InventoryBatch::getLockedQuantity, 0)
                .orderByAsc(InventoryBatch::getInboundDate));

        int remainingToDeduct = quantityToDeduct;

        for (InventoryBatch batch : batches) {
            if (remainingToDeduct <= 0) break;

            int lockedInBatch = batch.getLockedQuantity();
            int deductAmount = Math.min(lockedInBatch, remainingToDeduct);

            int updated = this.baseMapper.deductLockedQuantity(batch.getId(), deductAmount);
            if (updated > 0) {
                remainingToDeduct -= deductAmount;
            }
        }

        if (remainingToDeduct > 0) {
            throw new BizException(400, "出库扣减异常，可能是未提前锁定足够的库存");
        }
    }
}
