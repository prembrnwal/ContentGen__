package com.ContentGen.ContentGen_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_keywords")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "content")
@EqualsAndHashCode(exclude = "content")
public class ContentKeyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keyword;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private Content content;
}
