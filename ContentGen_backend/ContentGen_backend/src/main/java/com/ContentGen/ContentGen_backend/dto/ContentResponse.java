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
    
    // New fields for varied AI modes
    private String hook;
    private String script;
    private String visual;
    private String audio;
    private String viralReason;
    private String seoIntro;
    private List<java.util.Map<String, String>> headings; // For Blog mode
    private List<String> steps; // For Education mode
    private String problem; // For Marketing mode
    private String solution;
    private List<String> benefits;
    private String cta;
    private String story; // For Story mode
    private String ending;

    // Additional fields mapped for FE
    private String topic;
    private String template;
    private String platform;
    private String audience;
    private String tone;
    private Integer numberOfIdeas;
    private Integer ideaIndex;
    private String ts;
    private String preview; // Added to match frontend 'preview' expectations
}
