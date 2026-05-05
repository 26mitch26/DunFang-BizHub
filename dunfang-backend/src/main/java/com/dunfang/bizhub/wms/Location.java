package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_location")
public class Location extends BaseEntity {
    private Long companyId;
    private Long warehouseId;
    private String code;
    private String remark;
}
