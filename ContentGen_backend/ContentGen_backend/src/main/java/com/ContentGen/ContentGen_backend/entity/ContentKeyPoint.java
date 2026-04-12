package com.ContentGen.ContentGen_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_key_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentKeyPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String point;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private Content content;
}
