package com.ContentGen.ContentGen_backend.controller;

import com.ContentGen.ContentGen_backend.dto.ContentGenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentRegenerateRequest;
import com.ContentGen.ContentGen_backend.dto.ContentResponse;
import com.ContentGen.ContentGen_backend.dto.DownloadRequest;
import com.ContentGen.ContentGen_backend.entity.Content;
import com.ContentGen.ContentGen_backend.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContentController {

    private final ContentService contentService;

    @PostMapping("/generate")
    public ResponseEntity<List<ContentResponse>> generateContent(@Valid @RequestBody ContentGenerateRequest request) {
        return ResponseEntity.ok(contentService.generateContent(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Content>> getHistory(@RequestParam String userId) {
        return ResponseEntity.ok(contentService.getHistory(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteContent(@PathVariable String id) {
        contentService.deleteContent(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/regenerate/{id}")
    public ResponseEntity<ContentResponse> regenerateContent(
            @PathVariable String id,
            @RequestBody ContentRegenerateRequest request) {
        return ResponseEntity.ok(contentService.regenerateContent(id, request));
    }

    @PostMapping("/download")
    public ResponseEntity<Map<String, String>> downloadContent(@Valid @RequestBody DownloadRequest request) {
        String url = contentService.downloadContent(request.getContentId(), request.getFormat());
        return ResponseEntity.ok(Map.of("url", url));
    }
}
