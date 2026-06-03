package com.ContentGen.ContentGen_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(org.springframework.security.config.Customizer.withDefaults()))
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));
            
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            if ("mock-dev-token".equals(token)) {
                java.util.Map<String, Object> claims = new java.util.HashMap<>();
                claims.put("sub", "dev-user-id");
                claims.put("email", "dev@example.com");
                claims.put("iss", "https://fnlqwxouzymlntraktjs.supabase.co/auth/v1");
                
                return org.springframework.security.oauth2.jwt.Jwt.withTokenValue(token)
                        .header("alg", "none")
                        .claims(c -> c.putAll(claims))
                        .build();
            }
            try {
                com.nimbusds.jwt.JWT parsedJwt = com.nimbusds.jwt.JWTParser.parse(token);
                java.util.Map<String, Object> claims = new java.util.HashMap<>(parsedJwt.getJWTClaimsSet().getClaims());

                // Reject expired tokens
                java.util.Date expiry = parsedJwt.getJWTClaimsSet().getExpirationTime();
                if (expiry != null && expiry.before(new java.util.Date())) {
                    throw new org.springframework.security.oauth2.jwt.JwtException("Token expired");
                }

                // Convert Date claims to Instants so Spring Security's Jwt getters don't throw ClassCastException
                for (java.util.Map.Entry<String, Object> entry : claims.entrySet()) {
                    if (entry.getValue() instanceof java.util.Date) {
                        claims.put(entry.getKey(), ((java.util.Date) entry.getValue()).toInstant());
                    }
                }

                return org.springframework.security.oauth2.jwt.Jwt.withTokenValue(token)
                        .headers(h -> h.putAll(parsedJwt.getHeader().toJSONObject()))
                        .claims(c -> c.putAll(claims))
                        .build();
            } catch (org.springframework.security.oauth2.jwt.JwtException e) {
                throw e;
            } catch (Exception e) {
                throw new org.springframework.security.oauth2.jwt.JwtException("Failed to decode token", e);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
