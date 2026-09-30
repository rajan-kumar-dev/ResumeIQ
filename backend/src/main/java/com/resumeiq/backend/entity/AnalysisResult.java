package com.resumeiq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "analysis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "match_score")
    private Integer matchScore;

    // Stored as comma-separated or JSON text; kept simple for now.
    // Consider @ElementCollection or a JSON column type later if needed.
    @Column(name = "matching_skills", columnDefinition = "TEXT")
    private String matchingSkillsRaw;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkillsRaw;

    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @Transient
    public List<String> getMatchingSkills() {
        return matchingSkillsRaw == null || matchingSkillsRaw.isBlank()
                ? List.of()
                : List.of(matchingSkillsRaw.split(","));
    }

    @Transient
    public List<String> getMissingSkills() {
        return missingSkillsRaw == null || missingSkillsRaw.isBlank()
                ? List.of()
                : List.of(missingSkillsRaw.split(","));
    }
}
