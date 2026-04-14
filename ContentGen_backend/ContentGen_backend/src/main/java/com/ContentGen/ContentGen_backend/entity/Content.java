package com.ContentGen.ContentGen_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contents")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"keyPoints", "keywords"})
@EqualsAndHashCode(exclude = {"keyPoints", "keywords"})
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
    private String hook;

    @Column(columnDefinition="TEXT")
    private String script;

    @Column(columnDefinition="TEXT")
    private String visual;

    @Column(columnDefinition="TEXT")
    private String audio;

    @Column(columnDefinition="TEXT")
    private String viralReason;

    @Column(columnDefinition="TEXT")
    private String seoIntro;

    @Column(columnDefinition="TEXT")
    private String story;

    @Column(columnDefinition="TEXT")
    private String ending;

    @Column(columnDefinition="TEXT")
    private String problem;

    @Column(columnDefinition="TEXT")
    private String solution;

    @Column(columnDefinition="TEXT")
    private String cta;

    @Column(columnDefinition="TEXT")
    private String stepsJson; // Serialized list of steps

    @Column(columnDefinition="TEXT")
    private String benefitsJson; // Serialized list of benefits

    @Column(columnDefinition="TEXT")
    private String headingsJson; // Serialized list of headings (h2/content)

    @Column(columnDefinition="TEXT")
    private String rawJsonResponse;

    private Integer qualityScore; // Optional

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private Integer ideaIndex;
    private Integer numberOfIdeas;
}
