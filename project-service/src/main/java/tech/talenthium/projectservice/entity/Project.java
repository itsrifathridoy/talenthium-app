package tech.talenthium.projectservice.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import tech.talenthium.projectservice.annotation.UniqueGitLink;
import tech.talenthium.projectservice.type.Privacy;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String name;
    @NotNull
    @Column(nullable = false)

    private String tagline;

    @NotNull
    @Column(length = 1000,nullable = false)   // enforce 1000 char max
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    @Basic(fetch = FetchType.LAZY)
    private String detailedDescription;

    @Column(unique = true, nullable = true)
    private String liveLink;

    @NotNull
    @Column(unique = true,nullable = false)
    private String gitLink;

    @Column(name = "default_branch")
    private String defaultBranch;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Privacy privacy;

    @NotNull
    @Column(nullable = false)
    private Long ownerId;

    // Relations
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "project-contributors")
    private List<Contributor> contributors = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "project-contributions")
    private List<Contribution> contributions = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "project-deployments")
    private List<Deployment> deployments = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_tags",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<ProjectTag> tags = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "project_tech_stacks",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "tech_stack_id")
    )
    private List<ProjectTechStack> techStack = new ArrayList<>();

}
