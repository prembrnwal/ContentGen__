package com.ContentGen.ContentGen_backend.controller;

import com.ContentGen.ContentGen_backend.entity.Tone;
import com.ContentGen.ContentGen_backend.service.ToneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ToneController {

    private final ToneService toneService;

    @GetMapping
    public ResponseEntity<List<Tone>> getTones() {
        return ResponseEntity.ok(toneService.getAllTones());
    }
}
