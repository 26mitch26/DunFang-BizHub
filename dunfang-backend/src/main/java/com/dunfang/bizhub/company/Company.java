package com.dunfang.bizhub.company;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("company")
public class Company extends BaseEntity {

    private String name;
    private String shortName;
    private String type;
    private String taxId;
    private String taxpayerType;
    private String province;
    private String city;
    private String district;
    private String address;
    private String businessScope;
    private String parkName;
    private String bankName;
    private String bankAccount;
    private String legalPerson;
    private String contactPhone;
    private String contactEmail;
    private String status;
    private String remark;
}
