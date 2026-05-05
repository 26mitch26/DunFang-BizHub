package com.dunfang.bizhub.gifting;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("gift_budget_rule")
public class GiftBudgetRule extends BaseEntity {
    private Long companyId;
    private String customerLevel; // A, B, C, D
    private Long festivalId;
    private BigDecimal budgetLimit;
}
