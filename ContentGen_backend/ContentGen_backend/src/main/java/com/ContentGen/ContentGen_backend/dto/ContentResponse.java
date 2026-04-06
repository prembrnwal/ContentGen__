package com.ContentGen.ContentGen_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentResponse {
    private String id;
    private String title;
    private String introduction;
    private List<String> keyPoints;
    private String conclusion;
    private List<String> keywords;
    private String summary;
    private String rawJsonResponse;
    private Integer qualityScore;
    
    // Additional fields mapped for FE
    private String topic;
    private String template;
    private String platform;
    private String audience;
    private String tone;
    private Integer numberOfIdeas;
    private Integer ideaIndex;
    private String ts;
}
