package com.dunfang.bizhub.security;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dunfang.bizhub.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    private String email;
    private String phone;
    private String passwordHash;
    private String nickname;
    private String avatar;
    private String status;
}
