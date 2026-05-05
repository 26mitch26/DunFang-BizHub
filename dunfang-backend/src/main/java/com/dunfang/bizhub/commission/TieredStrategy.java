package com.dunfang.bizhub.commission;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Tiered commission: applies different rates based on order amount thresholds.
 * JSON tiers format: [{"min": 0, "max": 10000, "rate": 0.03}, {"min": 10000, "max": 50000, "rate": 0.05}, ...]
 */
@Slf4j
@Component("TIERED")
@RequiredArgsConstructor
public class TieredStrategy implements CommissionStrategy {

    private final ObjectMapper objectMapper;

    @Override
    public BigDecimal calculate(BigDecimal orderAmount, CommissionRule rule) {
        try {
            List<Map<String, Object>> tiers = objectMapper.readValue(
                    rule.getTiers(), new TypeReference<>() {});

            // Sort by min ascending
            tiers.sort(Comparator.comparingDouble(t -> ((Number) t.get("min")).doubleValue()));

            // Find matching tier
            for (int i = tiers.size() - 1; i >= 0; i--) {
                BigDecimal min = new BigDecimal(tiers.get(i).get("min").toString());
                if (orderAmount.compareTo(min) >= 0) {
                    BigDecimal rate = new BigDecimal(tiers.get(i).get("rate").toString());
                    return orderAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
                }
            }

            return BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("Failed to parse tiered commission rule", e);
            return BigDecimal.ZERO;
        }
    }
}
