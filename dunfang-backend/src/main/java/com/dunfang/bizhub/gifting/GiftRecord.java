package com.dunfang.bizhub.gifting;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("gift_record")
public class GiftRecord extends BaseEntity {
    private Long customerId;
    private Long festivalId;
    private String giftName;
    private BigDecimal cost;
    private String status; // PLANNED, SENT, DELIVERED
    private LocalDate sendDate;
    private String trackingNo;
    private String remark;
}
