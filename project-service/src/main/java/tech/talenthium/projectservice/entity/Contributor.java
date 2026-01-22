package tech.talenthium.projectservice.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "contributors")
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Contributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contributorId;

    @ManyToOne
    @NotNull
    @JsonBackReference(value = "project-contributors")
    private Project project;

    @NotNull
    @Column(nullable = false)
    private String name;

    @Column(name = "github_username")
    private String githubUsername;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Email
    @Column(name = "email")
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
