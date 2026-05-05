package com.dunfang.bizhub.customer;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("customer")
public class Customer extends BaseEntity {

    private Long companyId;
    private String name;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private String region;
    private String tier;
    private String level;
    private LocalDate birthday;
    private LocalDate lastOrderDate;
    private String remark;
}
