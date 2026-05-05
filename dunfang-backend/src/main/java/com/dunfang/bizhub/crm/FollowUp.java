package com.dunfang.bizhub.crm;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_follow_up")
public class FollowUp extends BaseEntity {
    private Long customerId;
    private String contactPerson;
    private String followType; // VISIT, CALL, MESSAGE, OTHER
    private String content;
    private LocalDateTime nextFollowDate;
}
