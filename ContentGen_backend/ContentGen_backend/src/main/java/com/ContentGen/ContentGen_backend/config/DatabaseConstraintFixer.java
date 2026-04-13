package com.ContentGen.ContentGen_backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintFixer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixConstraints() {
        log.info("[DB Fix] Checking and applying Primary Key constraints for Supabase Dashboard compatibility...");

        applyPk("contents");
        applyPk("users");
        applyPk("content_key_points");
        applyPk("content_keywords");
        applyPk("templates");
        applyPk("tones");

        log.info("[DB Fix] Constraint check completed.");
    }

    private void applyPk(String tableName) {
        try {
            // This SQL adds the primary key constraint only if it doesn't exist
            // We use a DO block to make it idempotent (safe to run multiple times)
            String sql = "DO $$ " +
                         "BEGIN " +
                         "  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints " +
                         "                 WHERE table_name = '" + tableName + "' AND constraint_type = 'PRIMARY KEY') THEN " +
                         "    ALTER TABLE " + tableName + " ADD PRIMARY KEY (id); " +
                         "  END IF; " +
                         "END $$;";
            
            jdbcTemplate.execute(sql);
            log.info("[DB Fix] Verified Primary Key for table: " + tableName);
        } catch (Exception e) {
            log.warn("[DB Fix] Could not apply Primary Key to " + tableName + ": " + e.getMessage());
        }
    }
}
