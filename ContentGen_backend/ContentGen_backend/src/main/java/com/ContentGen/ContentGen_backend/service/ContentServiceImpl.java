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

    /**
     * Cache key: combination of all request fields that determine the output.
     * On a cache HIT the Gemini API is NOT called — the cached List<ContentResponse> is returned directly.
     * On a cache MISS the API is called, result saved to DB, then stored in Redis for 1 hour.
     */
    @Cacheable(
        value = "content-generate",
        key  = "(#request.userId ?: 'anon') + ':' + #request.topic + ':' + #request.template
              + ':' + #request.tone + ':' + #request.platform + ':' + #request.audience
              + ':' + (#request.numberOfIdeas ?: 1)"
    )
    @Override
    public List<ContentResponse> generateContent(ContentGenerateRequest request) {
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

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3-flash-preview",
                            fullPrompt,
                            null);

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

        return generatedOutput;
    }

    /** Cache user history for 10 minutes (TTL set in RedisConfig). */
    @Cacheable(value = "content-history", key = "#userId")
    @Override
    public List<Content> getHistory(String userId) {
        System.out.println("[Cache MISS] Loading history from DB for userId: " + userId);
        return contentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Evict both caches on delete:
     *   - content-history (allEntries) so the deleted item disappears from all user lists
     *   - content-generate (allEntries) so stale generated content is not served from cache
     */
    @Caching(evict = {
        @CacheEvict(value = "content-history",  allEntries = true),
        @CacheEvict(value = "content-generate", allEntries = true)
    })
    @Override
    public void deleteContent(String id) {
        contentRepository.deleteById(id);
    }

    /**
     * Evict both caches on regenerate so next fetch gets fresh data.
     */
    @Caching(evict = {
        @CacheEvict(value = "content-history",  allEntries = true),
        @CacheEvict(value = "content-generate", allEntries = true)
    })
    @Override
    public ContentResponse regenerateContent(String id, ContentRegenerateRequest request) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (request.getTopic() != null) content.setPrompt(request.getTopic());
        if (request.getTemplate() != null) content.setTemplate(request.getTemplate());
        if (request.getPlatform() != null) content.setPlatform(request.getPlatform());
        if (request.getAudience() != null) content.setAudience(request.getAudience());
        if (request.getTone() != null) content.setTone(request.getTone());

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

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3-flash-preview",
                            fullPrompt,
                            null);

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

    private ContentResponse mapToResponse(Content content) {
        return ContentResponse.builder()
                .id(content.getId())
                .title(content.getTitle())
                .introduction(content.getIntroduction())
                .keyPoints(content.getKeyPoints())
                .conclusion(content.getConclusion())
                .keywords(content.getKeywords())
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
