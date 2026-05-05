package com.dunfang.bizhub.sales;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.commission.CommissionService;
import com.dunfang.bizhub.common.BizException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderMapper orderMapper;
    private final SalesOrderItemMapper itemMapper;
    private final CommissionService commissionService;
    private final StringRedisTemplate redisTemplate;

    public IPage<SalesOrder> page(int current, int size, Long companyId, Long customerId, String status) {
        LambdaQueryWrapper<SalesOrder> wrapper = new LambdaQueryWrapper<>();
        if (companyId != null) {
            wrapper.eq(SalesOrder::getCompanyId, companyId);
        }
        if (customerId != null) {
            wrapper.eq(SalesOrder::getCustomerId, customerId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(SalesOrder::getStatus, status);
        }
        wrapper.orderByDesc(SalesOrder::getCreatedAt);
        return orderMapper.selectPage(new Page<>(current, size), wrapper);
    }

    public SalesOrder getById(Long id) {
        SalesOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BizException(404, "Order not found");
        }
        return order;
    }

    public List<SalesOrderItem> getItems(Long orderId) {
        return itemMapper.selectList(
                new LambdaQueryWrapper<SalesOrderItem>().eq(SalesOrderItem::getOrderId, orderId));
    }

    @Transactional
    public SalesOrder create(SalesOrder order, List<SalesOrderItem> items) {
        validateItems(items);
        order.setOrderNo(generateOrderNo());
        if (order.getStatus() == null) {
            order.setStatus("DRAFT");
        }
        fillOrderAmounts(order, items);
        orderMapper.insert(order);

        for (SalesOrderItem item : items) {
            item.setOrderId(order.getId());
            itemMapper.insert(item);
        }
        return order;
    }

    @Transactional
    public SalesOrder confirm(Long id) {
        SalesOrder order = getById(id);
        if (!"DRAFT".equals(order.getStatus())) {
            throw new BizException(400, "Only DRAFT orders can be confirmed");
        }
        order.setStatus("CONFIRMED");
        orderMapper.updateById(order);

        // Trigger commission calculation
        commissionService.calculateForOrder(order);

        return order;
    }

    @Transactional
    public SalesOrder update(Long id, SalesOrder order, List<SalesOrderItem> items) {
        SalesOrder existing = getById(id);
        if (!"DRAFT".equals(existing.getStatus())) {
            throw new BizException(400, "Only DRAFT orders can be edited");
        }
        validateItems(items);
        order.setId(id);
        order.setOrderNo(existing.getOrderNo());
        order.setStatus(existing.getStatus());
        fillOrderAmounts(order, items);
        orderMapper.updateById(order);
        itemMapper.delete(new LambdaQueryWrapper<SalesOrderItem>().eq(SalesOrderItem::getOrderId, id));
        for (SalesOrderItem item : items) {
            item.setId(null);
            item.setOrderId(id);
            itemMapper.insert(item);
        }
        return orderMapper.selectById(id);
    }

    @Transactional
    public void delete(Long id) {
        SalesOrder existing = getById(id);
        if (!"DRAFT".equals(existing.getStatus()) && !"CANCELLED".equals(existing.getStatus())) {
            throw new BizException(400, "Only DRAFT or CANCELLED orders can be deleted");
        }
        itemMapper.delete(new LambdaQueryWrapper<SalesOrderItem>().eq(SalesOrderItem::getOrderId, id));
        orderMapper.deleteById(id);
    }

    private void validateItems(List<SalesOrderItem> items) {
        if (items == null || items.isEmpty()) {
            throw new BizException(400, "Order items are required");
        }
    }

    private void fillOrderAmounts(SalesOrder order, List<SalesOrderItem> items) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SalesOrderItem item : items) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new BizException(400, "Item quantity must be greater than 0");
            }
            if (item.getUnitPrice() == null) {
                throw new BizException(400, "Item unit price is required");
            }
            BigDecimal lineTotal =
                    item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            item.setTotalPrice(lineTotal);
            totalAmount = totalAmount.add(lineTotal);
        }
        order.setTotalAmount(totalAmount);
    }

    private String generateOrderNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String redisKey = "order:seq:" + date;
        Long seq = redisTemplate.opsForValue().increment(redisKey);
        if (seq != null && seq == 1L) {
            redisTemplate.expire(redisKey, java.time.Duration.ofDays(2));
        }
        return String.format("SO%s-%05d", date, seq != null ? seq : 1);
    }
}
