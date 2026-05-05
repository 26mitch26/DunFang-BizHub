package com.dunfang.bizhub.gifting;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("gift_festival")
public class GiftFestival extends BaseEntity {
    private String name;
    private LocalDate festivalDate;
    private Integer lunarMonth;
    private Integer lunarDay;
    private Boolean isLunar;
    private String description;
}
