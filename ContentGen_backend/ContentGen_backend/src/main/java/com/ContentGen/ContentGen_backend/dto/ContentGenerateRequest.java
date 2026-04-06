package com.ContentGen.ContentGen_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContentGenerateRequest {
    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Template is required")
    private String template;
    
    @NotBlank(message = "Platform is required")
    private String platform;
    
    @NotBlank(message = "Tone is required")
    private String tone;
    
    @NotBlank(message = "Audience is required")
    private String audience;
    
    private Integer numberOfIdeas;
    
    private String userId; // Optional
}
