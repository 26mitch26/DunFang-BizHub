package com.dunfang.bizhub.sales;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("sales_order_item")
public class SalesOrderItem {

    private Long id;
    private Long orderId;
    private String productName;
    private String specification;
    private String unit;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
