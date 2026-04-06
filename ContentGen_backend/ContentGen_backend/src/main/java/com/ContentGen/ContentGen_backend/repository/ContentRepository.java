package com.ContentGen.ContentGen_backend.repository;

import com.ContentGen.ContentGen_backend.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, String> {
    List<Content> findByUserIdOrderByCreatedAtDesc(String userId);
}
