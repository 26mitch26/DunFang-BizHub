package com.dunfang.bizhub.security;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sys_role")
public class SysRole {

    private Long id;
    private String roleCode;
    private String roleName;
    private String description;
}
