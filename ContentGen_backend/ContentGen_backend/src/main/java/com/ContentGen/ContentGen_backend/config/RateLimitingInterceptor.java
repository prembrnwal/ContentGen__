package com.ContentGen.ContentGen_backend.config;

import com.ContentGen.ContentGen_backend.exception.RateLimitException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    
    // Limits: 5 requests per minute
    private static final int MAX_REQUESTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String key = resolveKey(request);
        String redisKey = "rate_limit:" + key;

        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            
            if (count == null) return true;

            if (count == 1) {
                redisTemplate.expire(redisKey, WINDOW);
            }

            if (count > MAX_REQUESTS) {
                throw new RateLimitException("You have exceeded the rate limit of " + MAX_REQUESTS + " requests per minute. Please try again later.");
            }
        } catch (RateLimitException e) {
            throw e; // Rethrow expected rate limit exceptions
        } catch (Exception e) {
            // Log the error but allow the request to proceed (resilience over strict limiting)
            System.err.println("[RateLimit] Redis error: " + e.getMessage() + ". Skipping rate limit check.");
        }

        return true;
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject(); // Use Supabase User ID
        }
        
        // Fallback to IP address if not authenticated
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
