package com.dunfang.bizhub.commission;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("commission_rule")
public class CommissionRule extends BaseEntity {

    private Long brandId;
    private String ruleName;
    private String calcType;         // FIXED_RATE, TIERED, FIXED_AMOUNT
    private BigDecimal fixedRate;     // for FIXED_RATE
    private BigDecimal fixedAmount;   // for FIXED_AMOUNT
    private String tiers;            // JSON string for TIERED
    private Integer version;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String status;
}
