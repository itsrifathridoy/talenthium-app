package tech.talenthium.jobservices.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// This DTO is used to send job details in responses
// Also that is used to Update job details
public class JobResponse {
    private Long id;
    private Long recruiterId;
    private String title;
    private String companyName;
    private String location;
    private String jobType;
    private String salaryRange;
    private String workingHours;
    private String descriptionMarkdown;
    private String skills;
    private String experienceLevel;
    private LocalDateTime postedAt;
    private LocalDateTime expiresAt;
    private boolean active;
}
