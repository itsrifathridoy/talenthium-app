package tech.talenthium.projectservice.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @NotNull
    @JsonBackReference(value = "project-contributions")
    private Project project;

    @ManyToOne
    @NotNull
    private Contributor contributor;

    @NotNull
    @Column(unique = false)
    private String commitSha;

    @NotNull
    private String type;

    @Column(name = "branch", nullable = false)
    private String branch;

    @NotNull
    @Column(columnDefinition = "TEXT")
    private String commitMessage;

    @Column(columnDefinition = "TEXT")
    private String commitDescription;

    @ElementCollection
    private List<String> techStack;

    @Column(nullable = false)
    private Instant committedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // AI-generated summary fields (populated by CommitAnalysisService via Groq)
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @ElementCollection
    @CollectionTable(name = "contribution_ai_changes", joinColumns = @JoinColumn(name = "contribution_id"))
    @Column(name = "change_item", columnDefinition = "TEXT")
    private List<String> aiChanges;

    @Column(name = "ai_impact")
    private String aiImpact;

    @Column(name = "ai_type")
    private String aiType;

    @Column(name = "ai_files_changed")
    private Integer aiFilesChanged;

    @Column(name = "ai_additions")
    private Integer aiAdditions;

    @Column(name = "ai_deletions")
    private Integer aiDeletions;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
