package com.dunfang.bizhub.security;

import com.dunfang.bizhub.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Result<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return Result.ok(authService.register(request));
    }

    @PostMapping("/login")
    public Result<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request,
                               @RequestParam(required = false) String refreshToken) {
        String header = request.getHeader("Authorization");
        String accessToken = null;
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            accessToken = header.substring(7);
        }
        authService.logout(accessToken, refreshToken);
        return Result.ok();
    }

    @PostMapping("/refresh")
    public Result<TokenResponse> refresh(@RequestParam String refreshToken) {
        return Result.ok(authService.refreshToken(refreshToken));
    }
}
