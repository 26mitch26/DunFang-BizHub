package com.dunfang.bizhub.commission;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Fixed rate commission: orderAmount * fixedRate
 */
@Component("FIXED_RATE")
public class FixedRateStrategy implements CommissionStrategy {

    @Override
    public BigDecimal calculate(BigDecimal orderAmount, CommissionRule rule) {
        return orderAmount.multiply(rule.getFixedRate()).setScale(2, RoundingMode.HALF_UP);
    }
}
