package com.dunfang.bizhub.crm;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_customer_tag")
public class CustomerTag extends BaseEntity {
    private Long companyId;
    private Long customerId;
    private String tagName;
}
