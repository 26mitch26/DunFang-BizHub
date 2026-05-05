package com.dunfang.bizhub.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String generateAccessToken(Long userId, String email, Long companyId, List<String> roles, List<String> permissions) {
        return buildToken(userId, email, companyId, roles, permissions, accessExpiration);
    }

    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, null, null, null, refreshExpiration);
    }

    private String buildToken(Long userId, String email, Long companyId, List<String> roles, List<String> permissions, long expiration) {
        JwtBuilder builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key);
        if (roles != null) {
            builder.claim("roles", roles);
        }
        if (companyId != null) {
            builder.claim("companyId", companyId.toString());
        }
        if (permissions != null) {
            builder.claim("permissions", permissions);
        }
        return builder.compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserId(String token) {
        return Long.parseLong(parseToken(token).getSubject());
    }

    public Long getCompanyId(String token) {
        String companyId = parseToken(token).get("companyId", String.class);
        return companyId != null ? Long.parseLong(companyId) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> getPermissions(String token) {
        return parseToken(token).get("permissions", List.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        return parseToken(token).get("roles", List.class);
    }

    public long getRemainingExpiration(String token) {
        try {
            Date exp = parseToken(token).getExpiration();
            long remaining = exp.getTime() - System.currentTimeMillis();
            return Math.max(remaining, 0);
        } catch (JwtException e) {
            return 0;
        }
    }
}
