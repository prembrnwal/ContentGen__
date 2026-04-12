package com.ContentGen.ContentGen_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId; // Replaced ManyToOne with storing the user ID directly for NoSQL efficiency

    @Column(columnDefinition="TEXT")
    private String prompt;
    private String template; // Blog / Email / LinkedIn / Ad
    private String platform;
    private String audience;
    private String tone;     // Professional / Friendly / Funny / Formal

    private String title;

    @Column(columnDefinition="TEXT")
    private String introduction;

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ContentKeyPoint> keyPoints;

    @Column(columnDefinition="TEXT")
    private String conclusion;

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ContentKeyword> keywords;

    @Column(columnDefinition="TEXT")
    private String summary;

    @Column(columnDefinition="TEXT")
    private String rawJsonResponse;

    private Integer qualityScore; // Optional

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private Integer ideaIndex;
    private Integer numberOfIdeas;
}
