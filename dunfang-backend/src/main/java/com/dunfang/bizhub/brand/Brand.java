package com.dunfang.bizhub.brand;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("brand")
public class Brand extends BaseEntity {

    private String name;
    private String logo;
    private String description;
    private String contactPerson;
    private String contactPhone;
    private String status;
}
