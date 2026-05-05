package com.dunfang.bizhub.commission;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("commission_record")
public class CommissionRecord extends BaseEntity {

    private Long orderId;
    private Long ruleId;
    private String ruleSnapshot;      // JSON snapshot of rule at calculation time
    private BigDecimal orderAmount;
    private BigDecimal commissionAmount;
    private String status;            // PENDING, CONFIRMED, PAID
}
