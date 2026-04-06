package com.ContentGen.ContentGen_backend.service;

import com.ContentGen.ContentGen_backend.entity.Template;
import com.ContentGen.ContentGen_backend.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {
    private final TemplateRepository templateRepository;

    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }
}
