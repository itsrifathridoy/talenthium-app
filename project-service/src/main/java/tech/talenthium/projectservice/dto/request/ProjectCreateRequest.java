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
    @NotBlank(message = "Project tagline cannot be blank")
    private String tagline;

    @NotBlank(message = "Short description cannot be blank")
    @Size(min = 50, max = 1000, message = "Short description must be between 50 and 1000 characters")
    private String shortDescription;

    private String detailedDescription;

    @NotBlank(message = "Live link is required")
    @ValidURL
    @UniqueLiveLink
    private String liveLink;

    @NotBlank(message = "Git link is required")
    @UniqueGitLink
    private String gitLink;

    @NotNull(message = "Privacy setting is required")
    private Privacy privacy;

    public Project toEntity(Long ownerId) {
        return Project.builder()
                .name(this.name)
                .tagline(this.tagline)
                .shortDescription(this.shortDescription)
                .detailedDescription(this.detailedDescription)
                .liveLink(this.liveLink)
                .gitLink(this.gitLink)
                .privacy(this.privacy)
                .ownerId(ownerId)
                .build();
    }
}
