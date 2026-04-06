package com.ContentGen.ContentGen_backend.repository;

import com.ContentGen.ContentGen_backend.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRepository extends JpaRepository<Template, String> {
}
