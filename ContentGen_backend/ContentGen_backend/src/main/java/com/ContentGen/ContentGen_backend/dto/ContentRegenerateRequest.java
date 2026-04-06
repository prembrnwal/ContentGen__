package com.ContentGen.ContentGen_backend.dto;

import lombok.Data;

@Data
public class ContentRegenerateRequest {
    private String topic;
    private String template;
    private String platform;
    private String tone;
    private String audience;
    private Integer numberOfIdeas;
}
