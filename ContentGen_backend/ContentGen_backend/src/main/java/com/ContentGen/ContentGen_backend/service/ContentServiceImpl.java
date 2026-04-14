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
    private final com.ContentGen.ContentGen_backend.config.AiPromptProperties aiPromptProperties;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-3-flash-preview}")
    private String geminiModel;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

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
        log.info("[GENERATE] Topic: '{}', Template: '{}', Ideas: {}", request.getTopic(), request.getTemplate(), request.getNumberOfIdeas());

        String validUserId = "anon";
        if (request.getUserId() != null) {
            validUserId = request.getUserId();
            try {
                if (!userRepository.existsById(validUserId)) {
                    log.info("[User Sync] Attempting to create user: {}", validUserId);
                    User newUser = User.builder()
                            .id(validUserId)
                            .username("user-" + (validUserId.length() > 8 ? validUserId.substring(0, 8) : validUserId))
                            .createdAt(java.time.LocalDateTime.now())
                            .build();
                    userRepository.save(newUser);
                    log.info("[User Sync] User created successfully.");
                }
            } catch (Exception e) {
                log.warn("[User Sync Warning] Could NOT sync user: {}. Proceeding as anon. Error: {}", validUserId, e.getMessage());
                validUserId = "anon"; // Fallback to anon if sync fails
            }
        }

        int numIdeas = request.getNumberOfIdeas() != null ? request.getNumberOfIdeas() : 1;
        String generatedText = "[]";

        log.info("[Logic] Starting Gemini preparation for user: {}", validUserId);
        try (Client client = Client.builder().apiKey(geminiApiKey).build()) {
            String fullPrompt = aiPromptProperties.getGenerate()
                    .replace("{numIdeas}", String.valueOf(numIdeas))
                    .replace("{topic}", request.getTopic() != null ? request.getTopic() : "")
                    .replace("{template}", request.getTemplate() != null ? request.getTemplate() : "")
                    .replace("{tone}", request.getTone() != null ? request.getTone() : "")
                    .replace("{platform}", request.getPlatform() != null ? request.getPlatform() : "")
                    .replace("{audience}", request.getAudience() != null ? request.getAudience() : "");

            log.info("[Gemini] Calling API for {} ideas...", numIdeas);
            GenerateContentResponse response = callGeminiWithRetry(client, geminiModel, fullPrompt);
            
            generatedText = response.text().replace("```json", "").replace("```", "").trim();
            log.info("[Gemini] Received response (length: {})", generatedText.length());
            log.debug("--- RAW AI OUTPUT START ---");
            log.debug(generatedText);
            log.debug("--- RAW AI OUTPUT END ---");

            if (!generatedText.startsWith("[")) {
                generatedText = "[" + generatedText + "]";
            }
        } catch (Exception e) {
            log.error("[GENERATE ERROR] Gemini failed: {}", e.getMessage());
            throw new RuntimeException("AI Generation Failed: " + e.getMessage());
        }

        List<ContentResponse> generatedOutput = new ArrayList<>();
        try {
            log.info("[JSON] Parsing ideas...");
            List<ContentResponse> parsedIdeas = objectMapper.readValue(generatedText, new TypeReference<List<ContentResponse>>() {});
            log.info("[JSON] Parsed {} ideas from AI output.", parsedIdeas.size());
            
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
                        .hook(idea.getHook())
                        .script(idea.getScript())
                        .visual(idea.getVisual())
                        .audio(idea.getAudio())
                        .viralReason(idea.getViralReason())
                        .seoIntro(idea.getSeoIntro())
                        .story(idea.getStory())
                        .ending(idea.getEnding())
                        .problem(idea.getProblem())
                        .solution(idea.getSolution())
                        .cta(idea.getCta())
                        .build();

                // Serialize specialized collections
                try {
                    if (idea.getSteps() != null) content.setStepsJson(objectMapper.writeValueAsString(idea.getSteps()));
                    if (idea.getBenefits() != null) content.setBenefitsJson(objectMapper.writeValueAsString(idea.getBenefits()));
                    if (idea.getHeadings() != null) content.setHeadingsJson(objectMapper.writeValueAsString(idea.getHeadings()));
                } catch (Exception e) {
                    log.warn("Serialization of specialized fields failed for idea {}", index);
                }

                if (idea.getKeyPoints() != null) {
                    content.setKeyPoints(idea.getKeyPoints().stream()
                            .map(p -> ContentKeyPoint.builder().point(p).content(content).build())
                            .collect(java.util.stream.Collectors.toList()));
                }
                if (idea.getKeywords() != null) {
                    content.setKeywords(idea.getKeywords().stream()
                            .map(k -> ContentKeyword.builder().keyword(k).content(content).build())
                            .collect(java.util.stream.Collectors.toList()));
                }

                log.info("[DB] Saving idea {}/{}...", index, parsedIdeas.size());
                contentRepository.save(content);
                generatedOutput.add(mapToResponse(content));
                index++;
            }
        } catch (Exception e) {
            log.error("[JSON/DB ERROR] Mapping failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process generated content: " + e.getMessage());
        }

        log.info("[SUCCESS] Generated {} items.", generatedOutput.size());
        return generatedOutput;
    }

    // -----------------------------------------------------------------------
    // HISTORY — Returns DTOs (never Hibernate entities) to avoid PersistentBag
    //           serialization issues in Redis. Cached per userId for 10 min.
    // -----------------------------------------------------------------------
    @Cacheable(value = "content-history", key = "#userId")
    @Override
    public List<ContentResponse> getHistory(String userId) {
        log.info("Fetching history for user: {}", userId);
        
        if (userId != null && !userId.equals("test-user-id") && !userRepository.existsById(userId)) {
             User newUser = User.builder()
                        .id(userId)
                        .username("user-" + userId.substring(0, 8))
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                userRepository.save(newUser);
        }

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
        log.info("[REGENERATE] Based on content ID: {}", id);

        Content oldContent = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found: " + id));

        Content newEntity = new Content();
        newEntity.setPrompt(request.getTopic() != null ? request.getTopic() : oldContent.getPrompt());
        newEntity.setTemplate(request.getTemplate() != null ? request.getTemplate() : oldContent.getTemplate());
        newEntity.setPlatform(request.getPlatform() != null ? request.getPlatform() : oldContent.getPlatform());
        newEntity.setAudience(request.getAudience() != null ? request.getAudience() : oldContent.getAudience());
        newEntity.setTone(request.getTone() != null ? request.getTone() : oldContent.getTone());
        newEntity.setUserId(oldContent.getUserId());

        String generatedText = "[]";
        try (Client client = Client.builder().apiKey(geminiApiKey).build()) {
            String fullPrompt = aiPromptProperties.getRegenerate()
                    .replace("{topic}", newEntity.getPrompt() != null ? newEntity.getPrompt() : "")
                    .replace("{template}", newEntity.getTemplate() != null ? newEntity.getTemplate() : "")
                    .replace("{tone}", newEntity.getTone() != null ? newEntity.getTone() : "")
                    .replace("{platform}", newEntity.getPlatform() != null ? newEntity.getPlatform() : "")
                    .replace("{audience}", newEntity.getAudience() != null ? newEntity.getAudience() : "");

            log.info("[Gemini] Requesting regeneration...");
            GenerateContentResponse response = callGeminiWithRetry(client, geminiModel, fullPrompt);

            generatedText = response.text().replace("```json", "").replace("```", "").trim();
            log.debug("--- RAW REGENERATE OUTPUT START ---");
            log.debug(generatedText);
            log.debug("--- RAW REGENERATE OUTPUT END ---");

            if (!generatedText.startsWith("[")) {
                generatedText = "[" + generatedText + "]";
            }

            List<ContentResponse> parsedIdeas = objectMapper.readValue(generatedText, new TypeReference<List<ContentResponse>>() {});
            if (parsedIdeas != null && !parsedIdeas.isEmpty()) {
                ContentResponse idea = parsedIdeas.get(0);
                newEntity.setTitle(idea.getTitle());
                newEntity.setIntroduction(idea.getIntroduction());
                newEntity.setConclusion(idea.getConclusion());
                newEntity.setQualityScore(idea.getQualityScore());

                if (idea.getKeyPoints() != null) {
                    newEntity.setKeyPoints(idea.getKeyPoints().stream()
                            .map(p -> ContentKeyPoint.builder().point(p).content(newEntity).build())
                            .collect(java.util.stream.Collectors.toList()));
                }
                if (idea.getKeywords() != null) {
                    newEntity.setKeywords(idea.getKeywords().stream()
                            .map(k -> ContentKeyword.builder().keyword(k).content(newEntity).build())
                            .collect(java.util.stream.Collectors.toList()));
                }
            } else {
                log.warn("[REGENERATE] AI returned empty list.");
                throw new RuntimeException("AI failed to provide a new version.");
            }

            newEntity.setRawJsonResponse(generatedText);
            
            // Map specialized fields for regeneration
            if (!parsedIdeas.isEmpty()) {
                ContentResponse idea = parsedIdeas.get(0);
                newEntity.setHook(idea.getHook());
                newEntity.setScript(idea.getScript());
                newEntity.setVisual(idea.getVisual());
                newEntity.setAudio(idea.getAudio());
                newEntity.setViralReason(idea.getViralReason());
                newEntity.setSeoIntro(idea.getSeoIntro());
                newEntity.setStory(idea.getStory());
                newEntity.setEnding(idea.getEnding());
                newEntity.setProblem(idea.getProblem());
                newEntity.setSolution(idea.getSolution());
                newEntity.setCta(idea.getCta());
                
                try {
                    if (idea.getSteps() != null) newEntity.setStepsJson(objectMapper.writeValueAsString(idea.getSteps()));
                    if (idea.getBenefits() != null) newEntity.setBenefitsJson(objectMapper.writeValueAsString(idea.getBenefits()));
                    if (idea.getHeadings() != null) newEntity.setHeadingsJson(objectMapper.writeValueAsString(idea.getHeadings()));
                } catch (Exception e) {
                    log.warn("Serialization failed during regeneration");
                }
            }
            
            Content saved = contentRepository.save(newEntity);
            log.info("[REGENERATE SUCCESS] New content saved with ID: {}", saved.getId());
            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("[REGENERATE ERROR] Failed: {}", e.getMessage(), e);
            throw new RuntimeException("Regeneration failed: " + e.getMessage());
        }
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
        ContentResponse res = ContentResponse.builder()
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
                .preview(content.getIntroduction() != null ? content.getIntroduction() : content.getHook())
                .hook(content.getHook())
                .script(content.getScript())
                .visual(content.getVisual())
                .audio(content.getAudio())
                .viralReason(content.getViralReason())
                .seoIntro(content.getSeoIntro())
                .story(content.getStory())
                .ending(content.getEnding())
                .problem(content.getProblem())
                .solution(content.getSolution())
                .cta(content.getCta())
                .build();

        // Deserialize specialized collections
        try {
            if (content.getStepsJson() != null) {
                res.setSteps(objectMapper.readValue(content.getStepsJson(), new TypeReference<List<String>>() {}));
            }
            if (content.getBenefitsJson() != null) {
                res.setBenefits(objectMapper.readValue(content.getBenefitsJson(), new TypeReference<List<String>>() {}));
            }
            if (content.getHeadingsJson() != null) {
                res.setHeadings(objectMapper.readValue(content.getHeadingsJson(), new TypeReference<List<java.util.Map<String, String>>>() {}));
            }
        } catch (Exception e) {
            log.warn("Deserialization of specialized fields failed for content {}", content.getId());
        }

        return res;
    }
}
