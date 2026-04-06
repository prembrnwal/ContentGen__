package com.ContentGen.ContentGen_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DownloadRequest {
    @NotBlank(message = "Content ID is required")
    private String contentId;
    
    @NotBlank(message = "Format is required (PDF/DOCX)")
    private String format;
}
