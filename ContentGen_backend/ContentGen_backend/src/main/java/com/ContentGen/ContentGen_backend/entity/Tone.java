package com.ContentGen.ContentGen_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;

@Entity
@Table(name = "tones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tone {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;        // Professional / Friendly / Funny
    private String description;
}
