package com.ContentGen.ContentGen_backend.service;

import com.ContentGen.ContentGen_backend.dto.ContentGenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentRegenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentResponse;
import com.ContentGen.ContentGen_backend.entity.Content;
import java.util.List;

public interface ContentService {
    List<ContentResponse> generateContent(ContentGenerateRequest request);
    List<ContentResponse> getHistory(String userId);   // Returns DTOs — never cache raw entities
    void deleteContent(String id);
    ContentResponse regenerateContent(String id, ContentRegenerateRequest request);
    String downloadContent(String contentId, String format);
}
