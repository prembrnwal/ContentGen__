package com.ContentGen.ContentGen_backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Cache Configuration.
 *
 * Cache names and TTLs:
 *   - content-generate  : 1 hour  (caches expensive Gemini API responses keyed by request params)
 *   - content-history   : 10 min  (caches user history list; evicted on delete/regenerate)
 */
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * ObjectMapper configured with type information so that complex types
     * (List<ContentResponse>, etc.) can be deserialized correctly from Redis.
     */
    private ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    /**
     * Default cache configuration:
     *  - String keys
     *  - JSON values (with type info for safe deserialization)
     *  - Do NOT cache null values
     *  - Default TTL: 1 hour (overridden per cache below)
     */
    private RedisCacheConfiguration defaultCacheConfig() {
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(redisObjectMapper());

        return RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                .disableCachingNullValues()
                .entryTtl(Duration.ofHours(1));
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Per-cache TTL overrides
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        // Gemini API results - cache for 1 hour (same topic+params = same output)
        cacheConfigs.put("content-generate",
                defaultCacheConfig().entryTtl(Duration.ofHours(1)));

        // User history list - cache for 10 minutes (lighter, changes more often)
        cacheConfigs.put("content-history",
                defaultCacheConfig().entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig())
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
