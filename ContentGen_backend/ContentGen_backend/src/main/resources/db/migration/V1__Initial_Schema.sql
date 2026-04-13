-- V1__Initial_Schema.sql
-- High-level migration script to establish the base schema and primary keys

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contents Table
CREATE TABLE IF NOT EXISTS contents (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    prompt TEXT,
    template VARCHAR(50),
    platform VARCHAR(255),
    audience VARCHAR(255),
    tone VARCHAR(255),
    title VARCHAR(255),
    introduction TEXT,
    conclusion TEXT,
    summary TEXT,
    raw_json_response TEXT,
    quality_score INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    idea_index INTEGER,
    number_of_ideas INTEGER
);

-- Content Key Points (Many-to-One with Contents)
CREATE TABLE IF NOT EXISTS content_key_points (
    id BIGSERIAL PRIMARY KEY,
    point TEXT,
    content_id VARCHAR(255) REFERENCES contents(id) ON DELETE CASCADE
);

-- Content Keywords (Many-to-One with Contents)
CREATE TABLE IF NOT EXISTS content_keywords (
    id BIGSERIAL PRIMARY KEY,
    keyword VARCHAR(255),
    content_id VARCHAR(255) REFERENCES contents(id) ON DELETE CASCADE
);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    description TEXT
);

-- Tones Table
CREATE TABLE IF NOT EXISTS tones (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    description TEXT
);

-- Ensure primary keys are applied even if tables existed without them (idempotent fix)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'contents' AND constraint_type = 'PRIMARY KEY') THEN 
        ALTER TABLE contents ADD PRIMARY KEY (id); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY') THEN 
        ALTER TABLE users ADD PRIMARY KEY (id); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'content_key_points' AND constraint_type = 'PRIMARY KEY') THEN 
        ALTER TABLE content_key_points ADD PRIMARY KEY (id); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'content_keywords' AND constraint_type = 'PRIMARY KEY') THEN 
        ALTER TABLE content_keywords ADD PRIMARY KEY (id); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'templates' AND constraint_type = 'PRIMARY KEY') THEN 
        ALTER TABLE templates ADD PRIMARY KEY (id); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'tones' AND constraint_type = 'PRIMARY KEY') THEN 
        ALTER TABLE tones ADD PRIMARY KEY (id); 
    END IF;
END $$;
