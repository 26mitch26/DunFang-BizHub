package com.dunfang.bizhub.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dunfang.bizhub.common.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        // Check email uniqueness
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getEmail, req.getEmail()));
        if (count > 0) {
            throw new BizException(400, "Email already registered");
        }

        // Create user
        SysUser user = new SysUser();
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setNickname(req.getNickname() != null ? req.getNickname() : req.getEmail());
        user.setStatus("ACTIVE");
        userMapper.insert(user);

        // Assign default ADMIN role (first user gets admin)
        Long totalUsers = userMapper.selectCount(null);
        SysUserRole userRole = new SysUserRole();
        userRole.setUserId(user.getId());
        userRole.setRoleId(totalUsers <= 1 ? 1L : 2L); // First user = ADMIN, rest = SALES
        userRoleMapper.insert(userRole);

        // Assign default companyId (1 for MVP test)
        user.setCompanyId(1L);
        userMapper.updateById(user);

        List<String> roles = userMapper.selectRoleCodesByUserId(user.getId());
        List<String> permissions = userMapper.selectPermissionsByUserId(user.getId());
        return buildTokenResponse(user, roles, permissions);
    }

    public TokenResponse login(LoginRequest req) {
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getEmail, req.getEmail()));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BizException(401, "Invalid email or password");
        }
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BizException(403, "Account is locked or disabled");
        }

        List<String> roles = userMapper.selectRoleCodesByUserId(user.getId());
        List<String> permissions = userMapper.selectPermissionsByUserId(user.getId());
        return buildTokenResponse(user, roles, permissions);
    }

    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new BizException(401, "Invalid refresh token");
        }
        Long userId = jwtUtil.getUserId(refreshToken);
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(401, "User not found");
        }
        List<String> roles = userMapper.selectRoleCodesByUserId(userId);
        List<String> permissions = userMapper.selectPermissionsByUserId(userId);
        return buildTokenResponse(user, roles, permissions);
    }

    private TokenResponse buildTokenResponse(SysUser user, List<String> roles, List<String> permissions) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getCompanyId(), roles, permissions);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());
        return new TokenResponse(accessToken, refreshToken, user.getId(),
                user.getEmail(), user.getNickname(), roles);
    }
}
