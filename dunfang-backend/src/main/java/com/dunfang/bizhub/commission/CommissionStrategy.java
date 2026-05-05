package com.dunfang.bizhub.commission;

import java.math.BigDecimal;

/**
 * Strategy interface for commission calculation.
 */
public interface CommissionStrategy {

    BigDecimal calculate(BigDecimal orderAmount, CommissionRule rule);
}
