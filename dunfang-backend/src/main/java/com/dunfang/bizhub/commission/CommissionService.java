package com.dunfang.bizhub.commission;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.BizException;
import com.dunfang.bizhub.sales.SalesOrder;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommissionService {

    private final CommissionRuleMapper ruleMapper;
    private final CommissionRecordMapper recordMapper;
    private final Map<String, CommissionStrategy> strategyMap;
    private final ObjectMapper objectMapper;

    /**
     * Calculate commission for a confirmed order.
     * Finds the active rule matching the order's brand, applies the strategy,
     * and saves a commission record with a rule snapshot.
     */
    public void calculateForOrder(SalesOrder order) {
        // Find active rule for this brand
        CommissionRule rule = findActiveRule(order.getBrandId());
        if (rule == null) {
            log.info("No commission rule found for brand {}, skipping", order.getBrandId());
            return;
        }

        CommissionStrategy strategy = strategyMap.get(rule.getCalcType());
        if (strategy == null) {
            throw new BizException("Unknown commission calc type: " + rule.getCalcType());
        }

        BigDecimal commission = strategy.calculate(order.getTotalAmount(), rule);

        // Create record with rule snapshot
        CommissionRecord record = new CommissionRecord();
        record.setOrderId(order.getId());
        record.setRuleId(rule.getId());
        record.setOrderAmount(order.getTotalAmount());
        record.setCommissionAmount(commission);
        record.setStatus("PENDING");

        try {
            record.setRuleSnapshot(objectMapper.writeValueAsString(rule));
        } catch (Exception e) {
            log.warn("Failed to serialize rule snapshot", e);
        }

        recordMapper.insert(record);
        log.info("Commission calculated: order={}, amount={}, commission={}",
                order.getOrderNo(), order.getTotalAmount(), commission);
    }

    private CommissionRule findActiveRule(Long brandId) {
        LocalDate today = LocalDate.now();
        return ruleMapper.selectOne(new LambdaQueryWrapper<CommissionRule>()
                .eq(CommissionRule::getBrandId, brandId)
                .eq(CommissionRule::getStatus, "ACTIVE")
                .le(CommissionRule::getEffectiveFrom, today)
                .and(w -> w.ge(CommissionRule::getEffectiveTo, today)
                        .or().isNull(CommissionRule::getEffectiveTo))
                .orderByDesc(CommissionRule::getVersion)
                .last("LIMIT 1"));
    }

    // --- CRUD for rules ---

    public IPage<CommissionRule> pageRules(int current, int size, Long brandId) {
        LambdaQueryWrapper<CommissionRule> wrapper = new LambdaQueryWrapper<>();
        if (brandId != null) {
            wrapper.eq(CommissionRule::getBrandId, brandId);
        }
        wrapper.orderByDesc(CommissionRule::getCreatedAt);
        return ruleMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public CommissionRule createRule(CommissionRule rule) {
        if (rule.getVersion() == null) {
            rule.setVersion(1);
        }
        ruleMapper.insert(rule);
        return rule;
    }

    public CommissionRule updateRule(Long id, CommissionRule rule) {
        CommissionRule existing = ruleMapper.selectById(id);
        if (existing == null) {
            throw new BizException(404, "Commission rule not found");
        }
        rule.setId(id);
        rule.setVersion(existing.getVersion() + 1);
        ruleMapper.updateById(rule);
        return ruleMapper.selectById(id);
    }

    public void deleteRule(Long id) {
        ruleMapper.deleteById(id);
    }

    // --- Records ---

    public IPage<CommissionRecord> pageRecords(int current, int size, Long orderId) {
        LambdaQueryWrapper<CommissionRecord> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(CommissionRecord::getOrderId, orderId);
        }
        wrapper.orderByDesc(CommissionRecord::getCreatedAt);
        return recordMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public List<CommissionRecord> getRecordsByOrderId(Long orderId) {
        return recordMapper.selectList(
                new LambdaQueryWrapper<CommissionRecord>().eq(CommissionRecord::getOrderId, orderId));
    }
}
