package com.dunfang.bizhub.commission;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Fixed amount commission: returns rule.fixedAmount regardless of order amount.
 */
@Component("FIXED_AMOUNT")
public class FixedAmountStrategy implements CommissionStrategy {

    @Override
    public BigDecimal calculate(BigDecimal orderAmount, CommissionRule rule) {
        return rule.getFixedAmount();
    }
}
