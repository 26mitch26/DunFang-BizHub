package com.dunfang.bizhub.security;

import com.dunfang.bizhub.common.Result;
import com.dunfang.bizhub.config.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final SysUserMapper userMapper;

    @GetMapping("/currentUser")
    public Result<CurrentUserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return Result.fail(401, "Unauthenticated");
        }

        Long userId = resolveUserId(authentication.getPrincipal());
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return Result.fail(404, "User not found");
        }

        List<String> roles = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .toList();

        String displayName = user.getNickname() != null && !user.getNickname().isBlank()
                ? user.getNickname()
                : user.getEmail();

        CurrentUserResponse response = new CurrentUserResponse(
                user.getId(),
                String.valueOf(user.getId()),
                displayName,
                displayName,
                user.getEmail(),
                user.getAvatar(),
                TenantContextHolder.getTenantId(),
                roles,
                roles.contains("ADMIN") ? "admin" : "user");
        return Result.ok(response);
    }

    @GetMapping("/accountSettingCurrentUser")
    public Result<CurrentUserResponse> getAccountSetting() {
        return getCurrentUser();
    }

    private Long resolveUserId(Object principal) {
        if (principal instanceof Long userId) {
            return userId;
        }
        return Long.parseLong(String.valueOf(principal));
    }
}
