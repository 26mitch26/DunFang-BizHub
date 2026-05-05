package com.dunfang.bizhub.security;

import com.dunfang.bizhub.common.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginRateLimiter {

    private static final String KEY_PREFIX = "login:fail:";
    private static final int MAX_ATTEMPTS = 5;
    private static final int WINDOW_MINUTES = 5;

    private final StringRedisTemplate redisTemplate;

    public void checkAndRecordFailure(String email) {
        String key = KEY_PREFIX + email;
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, WINDOW_MINUTES, TimeUnit.MINUTES);
        }
        if (attempts != null && attempts >= MAX_ATTEMPTS) {
            throw new BizException(429, "登录失败次数过多，请 " + WINDOW_MINUTES + " 分钟后重试");
        }
    }

    public void clearFailures(String email) {
        redisTemplate.delete(KEY_PREFIX + email);
    }
}
