package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_inventory_batch")
public class InventoryBatch extends BaseEntity {
    private Long warehouseId;
    private Long locationId;
    private Long productId;
    private String batchNo;
    private LocalDate inboundDate;
    private BigDecimal unitCost;
    private Integer quantity;
    private Integer lockedQuantity;
}
