package com.ContentGen.ContentGen_backend.service;

import com.ContentGen.ContentGen_backend.dto.ContentGenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentRegenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentResponse;
import com.ContentGen.ContentGen_backend.entity.Content;
import com.ContentGen.ContentGen_backend.entity.User;
import com.ContentGen.ContentGen_backend.repository.ContentRepository;
import com.ContentGen.ContentGen_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

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
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        System.out.println("[Cache MISS] Calling Gemini API for topic: " + request.getTopic());

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
            String fullPrompt = String.format("""
                    You are an expert content strategist and marketing specialist. Return ONLY valid JSON array with no markdown, no preamble.
                    Return a JSON array of %d idea objects.

                    Generate structured and creative content ideas based on the following inputs:
                    Topic: %s
                    Template: %s
                    Tone: %s
                    Platform: %s
                    Target Audience: %s
                    
                    Instructions:
                    - Generate diverse and engaging content ideas
                    - Avoid repetition
                    - Make ideas practical and useful
                    - Ensure ideas are relevant to the target audience
                    - Keep descriptions concise but meaningful
                    - Maintain the requested tone

                    Each idea object must match this exact shape:
                    {
                      "title": "string",
                      "introduction": "2-3 sentences",
                      "keyPoints": ["string", "string", "string", "string"],
                      "conclusion": "2 sentences",
                      "keywords": ["word1", "word2", "word3", "word4", "word5"],
                      "qualityScore": number_60_to_98
                    }
                    """,
                    numIdeas, request.getTopic(), request.getTemplate(), request.getTone(), request.getPlatform(), request.getAudience());

            GenerateContentResponse response = callGeminiWithRetry(client, "gemini-3-flash-preview", fullPrompt);

            generatedText = response.text().replace("```json", "").replace("```", "").trim();
            if (!generatedText.startsWith("[")) {
                generatedText = "[" + generatedText + "]";
            }
        } catch (Exception e) {
            e.printStackTrace();
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
                        .keyPoints(idea.getKeyPoints())
                        .conclusion(idea.getConclusion())
                        .keywords(idea.getKeywords())
                        .qualityScore(idea.getQualityScore() != null ? idea.getQualityScore() : 95)
                        .numberOfIdeas(numIdeas)
                        .ideaIndex(index)
                        .rawJsonResponse(generatedText)
                        .build();

                contentRepository.save(content);
                generatedOutput.add(mapToResponse(content));
                index++;
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to parse JSON response");
        }

        System.out.println("[Cache STORE] Stored " + generatedOutput.size() + " ideas in Redis for topic: " + request.getTopic());
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
            String fullPrompt = String.format("""
                    You are an expert content strategist and marketing specialist. Return ONLY valid JSON array with no markdown, no preamble.
                    Return a JSON array of 1 idea object.

                    Regenerate structured and creative content ideas based on the following inputs:
                    Topic: %s
                    Template: %s
                    Tone: %s
                    Platform: %s
                    Target Audience: %s
                    
                    Each idea object must match this exact shape:
                    {
                      "title": "string",
                      "introduction": "2-3 sentences",
                      "keyPoints": ["string", "string", "string", "string"],
                      "conclusion": "2 sentences",
                      "keywords": ["word1", "word2", "word3", "word4", "word5"],
                      "qualityScore": number_60_to_98
                    }
                    """,
                    content.getPrompt(), content.getTemplate(), content.getTone(), content.getPlatform(), content.getAudience());

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
                content.setKeyPoints(idea.getKeyPoints());
                content.setConclusion(idea.getConclusion());
                content.setKeywords(idea.getKeywords());
                content.setQualityScore(idea.getQualityScore());
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
                // Force eager materialization — avoids Hibernate PersistentBag being
                // stored in Redis (which can't deserialize without an active session).
                .keyPoints(content.getKeyPoints() != null ? new ArrayList<>(content.getKeyPoints()) : null)
                .conclusion(content.getConclusion())
                .keywords(content.getKeywords() != null ? new ArrayList<>(content.getKeywords()) : null)
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
                .build();
    }
}

