package com.dunfang.bizhub.security;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CurrentUserResponse {

    private Long userId;
    private String userid;
    private String name;
    private String nickname;
    private String email;
    private String avatar;
    private Long companyId;
    private List<String> roles;
    private String access;
}
