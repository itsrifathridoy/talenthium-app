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

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
