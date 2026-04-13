package com.ContentGen.ContentGen_backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai.prompts")
@Data
public class AiPromptProperties {
    private String base;
    private String shape;
    private String generate;
    private String regenerate;
}
