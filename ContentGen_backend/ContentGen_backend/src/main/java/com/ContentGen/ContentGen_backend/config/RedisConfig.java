package com.ContentGen.ContentGen_backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
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
 * Key design decisions:
 *  1. Uses BasicPolymorphismValidator to WHITELIST only our DTOs + java.util types.
 *     This prevents Hibernate's PersistentBag/PersistentList from being embedded
 *     as type info in JSON (which would cause LazyInitializationException on read).
 *
 *  2. Cache TTLs:
 *     - content-generate : 1 hour  (expensive Gemini API calls)
 *     - content-history  : 10 min  (user history list)
 */
@Configuration
@EnableCaching
public class RedisConfig implements org.springframework.cache.annotation.CachingConfigurer {

    @Override
    public org.springframework.cache.interceptor.CacheErrorHandler errorHandler() {
        return new org.springframework.cache.interceptor.CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                System.err.println("Redis Cache GET Error [" + cache.getName() + "]: " + exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, org.springframework.cache.Cache cache, Object key, Object value) {
                System.err.println("Redis Cache PUT Error [" + cache.getName() + "]: " + exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                System.err.println("Redis Cache EVICT Error [" + cache.getName() + "]: " + exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, org.springframework.cache.Cache cache) {
                System.err.println("Redis Cache CLEAR Error [" + cache.getName() + "]: " + exception.getMessage());
            }
        };
    }


    /**
     * ObjectMapper with a STRICT PolymorphicTypeValidator.
     *
     * WHY: The default LaissezFaireSubTypeValidator allows ALL types, including
     * Hibernate's PersistentBag. If a PersistentBag reference ever reaches the
     * serializer, its class name gets embedded in JSON. On deserialization,
     * Jackson tries to instantiate PersistentBag — which needs a Hibernate session
     * (already closed) → LazyInitializationException.
     *
     * FIX: Only allow our DTOs (com.ContentGen), standard collections (java.util),
     * and primitives (java.lang). All Hibernate/JPA types are implicitly blocked.
     */
    private ObjectMapper redisObjectMapper() {
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.ContentGen.ContentGen_backend.dto")  // our DTOs
                .allowIfSubType("java.util")                               // ArrayList, LinkedList, etc.
                .allowIfSubType("java.lang")                               // String, Integer, etc.
                .allowIfSubTypeIsArray()                                    // primitive arrays
                .build();

        ObjectMapper mapper = new ObjectMapper();
        mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
        return mapper;
    }

    /**
     * Default cache configuration with JSON serialization.
     * Keys are plain Strings. Values are JSON with @class type info
     * restricted to our whitelist.
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
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        // Gemini API results — cache for 1 hour (same inputs = same output)
        cacheConfigs.put("content-generate",
                defaultCacheConfig().entryTtl(Duration.ofHours(1)));

        // User history list — cache for 10 minutes (lighter, evicted on mutations)
        cacheConfigs.put("content-history",
                defaultCacheConfig().entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig())
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}
