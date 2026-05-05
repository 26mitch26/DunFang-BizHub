package com.dunfang.bizhub.finance;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("finance_invoice")
public class FinanceInvoice {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long companyId;
    private String invoiceNo;

    private LocalDate invoiceDate;

    private String buyerName;

    private String buyerTaxId;

    private String sellerName;

    private BigDecimal totalAmount;

    private BigDecimal taxAmount;

    private String itemsJson;

    private Long matchedOrderId;

    private String status; // UNMATCHED, MATCHED

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
