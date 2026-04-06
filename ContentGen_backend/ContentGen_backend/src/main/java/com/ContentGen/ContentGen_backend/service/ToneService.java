package com.ContentGen.ContentGen_backend.service;

import com.ContentGen.ContentGen_backend.entity.Tone;
import com.ContentGen.ContentGen_backend.repository.ToneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ToneService {
    private final ToneRepository toneRepository;

    public List<Tone> getAllTones() {
        return toneRepository.findAll();
    }
}
