package com.ContentGen.ContentGen_backend.repository;

import com.ContentGen.ContentGen_backend.entity.Tone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ToneRepository extends JpaRepository<Tone, String> {
}
