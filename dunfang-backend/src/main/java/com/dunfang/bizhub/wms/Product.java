package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_product")
public class Product extends BaseEntity {
    private String skuCode;
    private String name;
    private Long categoryId;
    private Long brandId;
    private String unit;
    private String specifications;
    private String remark;
}
