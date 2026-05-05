package com.dunfang.bizhub.sales;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sales_order")
public class SalesOrder extends BaseEntity {

    private Long companyId;
    private Long customerId;
    private Long brandId;
    private String orderNo;
    private BigDecimal totalAmount;
    private BigDecimal costAmount;
    private BigDecimal profitAmount;
    private String status;
    private LocalDate orderDate;
    private String remark;
}
