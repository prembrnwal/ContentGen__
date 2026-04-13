package com.ContentGen.ContentGen_backend.service;

import com.ContentGen.ContentGen_backend.dto.ContentGenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentRegenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentResponse;
import com.ContentGen.ContentGen_backend.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import com.ContentGen.ContentGen_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final com.ContentGen.ContentGen_backend.config.AiPromptProperties aiPromptProperties;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @PostConstruct
    public void init() {
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            System.setProperty("GOOGLE_API_KEY", geminiApiKey);
        }
    }

    // -----------------------------------------------------------------------
    // GENERATE
    // Cache HIT  → returned from Redis, Gemini API is NOT called.
    // Cache MISS → Gemini called, DB saved, result stored in Redis for 1 hr.
    // Key = userId:topic:template:tone:platform:audience:numberOfIdeas
    // -----------------------------------------------------------------------
    @Cacheable(
        value = "content-generate",
        key   = "(#request.userId != null ? #request.userId : 'anon')"
              + " + ':' + #request.topic"
              + " + ':' + #request.template"
              + " + ':' + #request.tone"
              + " + ':' + #request.platform"
              + " + ':' + #request.audience"
              + " + ':' + (#request.numberOfIdeas != null ? #request.numberOfIdeas : 1)"
    )
    @Override
    public List<ContentResponse> generateContent(ContentGenerateRequest request) {
        log.info("Generating content for topic: {} using template: {}", request.getTopic(), request.getTemplate());

        String validUserId = null;
        if (request.getUserId() != null) {
            Optional<User> optionalUser = userRepository.findById(request.getUserId());
            if (optionalUser.isPresent()) {
                validUserId = optionalUser.get().getId();
            }
        }

        int numIdeas = request.getNumberOfIdeas() != null ? request.getNumberOfIdeas() : 1;
        String generatedText = "[]";

        try (Client client = Client.builder().apiKey(geminiApiKey).build()) {
            String fullPrompt = aiPromptProperties.getGenerate()
                    .replace("{numIdeas}", String.valueOf(numIdeas))
                    .replace("{topic}", request.getTopic() != null ? request.getTopic() : "")
                    .replace("{template}", request.getTemplate() != null ? request.getTemplate() : "")
                    .replace("{tone}", request.getTone() != null ? request.getTone() : "")
                    .replace("{platform}", request.getPlatform() != null ? request.getPlatform() : "")
                    .replace("{audience}", request.getAudience() != null ? request.getAudience() : "");

            GenerateContentResponse response = callGeminiWithRetry(client, "gemini-3-flash-preview", fullPrompt);

            generatedText = response.text().replace("```json", "").replace("```", "").trim();
            if (!generatedText.startsWith("[")) {
                generatedText = "[" + generatedText + "]";
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating content: " + e.getMessage());
        }

        List<ContentResponse> generatedOutput = new ArrayList<>();
        try {
            List<ContentResponse> parsedIdeas = objectMapper.readValue(generatedText, new TypeReference<List<ContentResponse>>() {});
            int index = 1;
            for (ContentResponse idea : parsedIdeas) {
                Content content = Content.builder()
                        .userId(validUserId)
                        .prompt(request.getTopic())
                        .template(request.getTemplate())
                        .platform(request.getPlatform())
                        .audience(request.getAudience())
                        .tone(request.getTone())
                        .title(idea.getTitle())
                        .introduction(idea.getIntroduction())
                        .conclusion(idea.getConclusion())
                        .qualityScore(idea.getQualityScore() != null ? idea.getQualityScore() : 95)
                        .numberOfIdeas(numIdeas)
                        .ideaIndex(index)
                        .rawJsonResponse(generatedText)
                        .build();

                // Convert String lists to Entity lists
                Content finalContent = content; // for lambda
                if (idea.getKeyPoints() != null) {
                    content.setKeyPoints(idea.getKeyPoints().stream()
                            .map(p -> ContentKeyPoint.builder().point(p).content(finalContent).build())
                            .collect(java.util.stream.Collectors.toList()));
                }
                if (idea.getKeywords() != null) {
                    content.setKeywords(idea.getKeywords().stream()
                            .map(k -> ContentKeyword.builder().keyword(k).content(finalContent).build())
                            .collect(java.util.stream.Collectors.toList()));
                }

                contentRepository.save(content);
                generatedOutput.add(mapToResponse(content));
                index++;
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to parse JSON response");
        }

        log.info("Successfully generated and saved {} content ideas for topic: {}", generatedOutput.size(), request.getTopic());
        return generatedOutput;
    }

    // -----------------------------------------------------------------------
    // HISTORY — Returns DTOs (never Hibernate entities) to avoid PersistentBag
    //           serialization issues in Redis. Cached per userId for 10 min.
    // -----------------------------------------------------------------------
    @Cacheable(value = "content-history", key = "#userId")
    @Override
    public List<ContentResponse> getHistory(String userId) {
        System.out.println("[Cache MISS] Loading history from DB for userId: " + userId);
        return contentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // DELETE — Evicts both caches so no stale data is ever returned.
    // -----------------------------------------------------------------------
    @Caching(evict = {
        @CacheEvict(value = "content-history",  allEntries = true),
        @CacheEvict(value = "content-generate", allEntries = true)
    })
    @Override
    public void deleteContent(String id) {
        System.out.println("[Cache EVICT] Cleared generate + history caches after delete id=" + id);
        contentRepository.deleteById(id);
    }

    // -----------------------------------------------------------------------
    // REGENERATE — Evicts both caches so next fetch returns fresh data.
    // -----------------------------------------------------------------------
    @Caching(evict = {
        @CacheEvict(value = "content-history",  allEntries = true),
        @CacheEvict(value = "content-generate", allEntries = true)
    })
    @Override
    public ContentResponse regenerateContent(String id, ContentRegenerateRequest request) {
        System.out.println("[Cache EVICT] Cleared generate + history caches after regenerate id=" + id);

        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (request.getTopic()    != null) content.setPrompt(request.getTopic());
        if (request.getTemplate() != null) content.setTemplate(request.getTemplate());
        if (request.getPlatform() != null) content.setPlatform(request.getPlatform());
        if (request.getAudience() != null) content.setAudience(request.getAudience());
        if (request.getTone()     != null) content.setTone(request.getTone());

        String generatedText = "[]";
        try (Client client = Client.builder().apiKey(geminiApiKey).build()) {
            String fullPrompt = aiPromptProperties.getRegenerate()
                    .replace("{topic}", content.getPrompt() != null ? content.getPrompt() : "")
                    .replace("{template}", content.getTemplate() != null ? content.getTemplate() : "")
                    .replace("{tone}", content.getTone() != null ? content.getTone() : "")
                    .replace("{platform}", content.getPlatform() != null ? content.getPlatform() : "")
                    .replace("{audience}", content.getAudience() != null ? content.getAudience() : "");

            GenerateContentResponse response = callGeminiWithRetry(client, "gemini-3-flash-preview", fullPrompt);

            generatedText = response.text().replace("```json", "").replace("```", "").trim();
            if (!generatedText.startsWith("[")) {
                generatedText = "[" + generatedText + "]";
            }

            List<ContentResponse> parsedIdeas = objectMapper.readValue(generatedText, new TypeReference<List<ContentResponse>>() {});
            if (!parsedIdeas.isEmpty()) {
                ContentResponse idea = parsedIdeas.get(0);
                content.setTitle(idea.getTitle());
                content.setIntroduction(idea.getIntroduction());
                content.setConclusion(idea.getConclusion());
                content.setQualityScore(idea.getQualityScore());

                // Update Nested entities
                if (idea.getKeyPoints() != null) {
                    content.getKeyPoints().clear();
                    content.getKeyPoints().addAll(idea.getKeyPoints().stream()
                            .map(p -> ContentKeyPoint.builder().point(p).content(content).build())
                            .collect(java.util.stream.Collectors.toList()));
                }
                if (idea.getKeywords() != null) {
                    content.getKeywords().clear();
                    content.getKeywords().addAll(idea.getKeywords().stream()
                            .map(k -> ContentKeyword.builder().keyword(k).content(content).build())
                            .collect(java.util.stream.Collectors.toList()));
                }
            }

            content.setRawJsonResponse(generatedText);
            contentRepository.save(content);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error regenerating content: " + e.getMessage());
        }

        return mapToResponse(content);
    }

    @Override
    public String downloadContent(String contentId, String format) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        return "https://contentgen.pro/downloads/" + contentId + "." + format.toLowerCase();
    }

    // -----------------------------------------------------------------------
    // GEMINI RETRY — Exponential backoff on 503 Service Unavailable.
    //                Retries up to 3 times: 1s → 2s → 4s.
    // -----------------------------------------------------------------------
    private com.google.genai.types.GenerateContentResponse callGeminiWithRetry(
            Client client, String model, String prompt) {
        int maxRetries = 3;
        long delayMs = 1000;
        Exception lastException = null;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return client.models.generateContent(model, prompt, null);
            } catch (Exception e) {
                lastException = e;
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean is503 = msg.contains("503") || msg.contains("Service Unavailable");
                if (is503 && attempt < maxRetries) {
                    System.out.printf("[Gemini Retry] Attempt %d failed (503). Retrying in %dms...%n", attempt, delayMs);
                    try { Thread.sleep(delayMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    delayMs *= 2; // exponential backoff
                } else {
                    break; // non-503 error or max retries reached
                }
            }
        }
        throw new RuntimeException("Gemini API error after " + maxRetries + " attempts: " + lastException.getMessage());
    }

    private ContentResponse mapToResponse(Content content) {
        return ContentResponse.builder()
                .id(content.getId())
                .title(content.getTitle())
                .introduction(content.getIntroduction())
                // Force eager materialization and Convert Entity lists back to String lists for DTO
                .keyPoints(content.getKeyPoints() != null ? 
                        content.getKeyPoints().stream().map(ContentKeyPoint::getPoint).collect(java.util.stream.Collectors.toList()) : null)
                .conclusion(content.getConclusion())
                .keywords(content.getKeywords() != null ? 
                        content.getKeywords().stream().map(ContentKeyword::getKeyword).collect(java.util.stream.Collectors.toList()) : null)
                .summary(content.getSummary())
                .rawJsonResponse(content.getRawJsonResponse())
                .qualityScore(content.getQualityScore())
                .topic(content.getPrompt())
                .template(content.getTemplate())
                .platform(content.getPlatform())
                .audience(content.getAudience())
                .tone(content.getTone())
                .numberOfIdeas(content.getNumberOfIdeas())
                .ideaIndex(content.getIdeaIndex())
                .ts(content.getCreatedAt() != null ? content.getCreatedAt().toString() : null)
                .preview(content.getIntroduction())
                .build();
    }
}
