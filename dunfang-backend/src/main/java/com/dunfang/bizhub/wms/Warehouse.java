package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_warehouse")
public class Warehouse extends BaseEntity {
    private Long companyId;
    private String name;
    private String address;
    private Long managerId;
    private String remark;
}
