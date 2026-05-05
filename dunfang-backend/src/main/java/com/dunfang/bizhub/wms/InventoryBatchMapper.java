package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface InventoryBatchMapper extends BaseMapper<InventoryBatch> {

    @Update("UPDATE wms_inventory_batch SET quantity = quantity - #{deductQty} WHERE id = #{id} AND quantity >= #{deductQty}")
    int deductQuantity(@Param("id") Long id, @Param("deductQty") int deductQty);

    @Update("UPDATE wms_inventory_batch SET locked_quantity = locked_quantity + #{lockQty} WHERE id = #{id} AND (quantity - locked_quantity) >= #{lockQty}")
    int lockQuantity(@Param("id") Long id, @Param("lockQty") int lockQty);
    
    @Update("UPDATE wms_inventory_batch SET quantity = quantity - #{deductQty}, locked_quantity = locked_quantity - #{deductQty} WHERE id = #{id} AND locked_quantity >= #{deductQty}")
    int deductLockedQuantity(@Param("id") Long id, @Param("deductQty") int deductQty);
}
