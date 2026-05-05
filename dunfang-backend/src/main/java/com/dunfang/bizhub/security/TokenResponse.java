package com.dunfang.bizhub.security;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TokenResponse {

    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String nickname;
    private List<String> roles;
}
