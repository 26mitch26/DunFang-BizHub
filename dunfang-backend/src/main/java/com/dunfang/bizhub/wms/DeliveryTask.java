package com.dunfang.bizhub.wms;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_delivery_task")
public class DeliveryTask extends BaseEntity {
    private String taskNo;
    private String type; // INBOUND, OUTBOUND
    private Long relatedOrderId;
    private String status; // PENDING, SHIPPING, COMPLETED, CANCELLED
    private String driverName;
    private String driverPhone;
    private LocalDate expectedDate;
    private LocalDate actualDate;
    private String remark;
}
