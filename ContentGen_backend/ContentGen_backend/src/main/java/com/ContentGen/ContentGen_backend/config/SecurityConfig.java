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
            // Disabled JWT scanning temporarily!
            // .oauth2ResourceServer(oauth2 -> oauth2.jwt(org.springframework.security.config.Customizer.withDefaults()))
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));
            
        return http.build();
    }

    /*
    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            try {
                com.nimbusds.jwt.JWT parsedJwt = com.nimbusds.jwt.JWTParser.parse(token);
                java.util.Map<String, Object> claims = parsedJwt.getJWTClaimsSet().getClaims();
                return org.springframework.security.oauth2.jwt.Jwt.withTokenValue(token)
                        .headers(h -> h.putAll(parsedJwt.getHeader().toJSONObject()))
                        .claims(c -> c.putAll(claims))
                        .build();
            } catch (Exception e) {
                throw new org.springframework.security.oauth2.jwt.JwtException("Failed to decode token", e);
            }
        };
    }
    */

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
