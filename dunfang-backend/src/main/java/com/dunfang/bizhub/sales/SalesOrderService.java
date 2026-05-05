package com.dunfang.bizhub.sales;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dunfang.bizhub.common.BizException;
import com.dunfang.bizhub.commission.CommissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderMapper orderMapper;
    private final SalesOrderItemMapper itemMapper;
    private final CommissionService commissionService;

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
        order.setOrderNo(generateOrderNo());
        if (order.getStatus() == null) {
            order.setStatus("DRAFT");
        }
        orderMapper.insert(order);

        if (items != null) {
            for (SalesOrderItem item : items) {
                item.setOrderId(order.getId());
                itemMapper.insert(item);
            }
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

    public SalesOrder update(Long id, SalesOrder order) {
        SalesOrder existing = getById(id);
        if (!"DRAFT".equals(existing.getStatus())) {
            throw new BizException(400, "Only DRAFT orders can be edited");
        }
        order.setId(id);
        orderMapper.updateById(order);
        return orderMapper.selectById(id);
    }

    public void delete(Long id) {
        SalesOrder existing = getById(id);
        if (!"DRAFT".equals(existing.getStatus()) && !"CANCELLED".equals(existing.getStatus())) {
            throw new BizException(400, "Only DRAFT or CANCELLED orders can be deleted");
        }
        orderMapper.deleteById(id);
    }

    private String generateOrderNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "SO" + date + random;
    }
}
