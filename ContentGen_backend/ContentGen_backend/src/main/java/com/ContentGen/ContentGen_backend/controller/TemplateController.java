package com.ContentGen.ContentGen_backend.controller;

import com.ContentGen.ContentGen_backend.entity.Template;
import com.ContentGen.ContentGen_backend.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TemplateController {
    
    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<List<Template>> getTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }
}
