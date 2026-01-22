package tech.talenthium.projectservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.talenthium.projectservice.annotation.UniqueGitLink;
import tech.talenthium.projectservice.annotation.UniqueLiveLink;
import tech.talenthium.projectservice.annotation.ValidURL;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.type.Privacy;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreateRequest {
    @NotBlank(message = "Project name cannot be blank")
    private String name;

    // optional slogan/tagline
    private String slogan;

    @NotBlank(message = "Short description cannot be blank")
    @Size(min = 10, max = 1000, message = "Short description must be between 10 and 1000 characters")
    private String shortDescription;

    @NotBlank(message = "Detailed description cannot be blank")
    @Size(min = 20, message = "Detailed description must be between 20 and 4000 characters")
    private String detailedDescription;

    @ValidURL
    @UniqueLiveLink
    private String projectLink;

    @NotBlank(message = "GitHub repository is required")
    @UniqueGitLink
    private String githubRepository; // full name owner/repo

    // Optional metadata from GitHub selector
    private String githubRepositoryId;
    private String defaultBranch;

    // Default to PUBLIC if not supplied
    private Privacy privacy = Privacy.PUBLIC;

    public Project toEntity(Long ownerId) {
        // Map DTO fields to entity schema
        return Project.builder()
            .name(this.name)
                .tagline(this.slogan == null ? "" : this.slogan)
            .shortDescription(this.shortDescription)
            .detailedDescription(this.detailedDescription)
            .liveLink(this.projectLink)
            .gitLink(this.githubRepository)
            .defaultBranch(this.defaultBranch)
            .privacy(this.privacy == null ? Privacy.PUBLIC : this.privacy)
            .ownerId(ownerId)
            .build();
    }
}
