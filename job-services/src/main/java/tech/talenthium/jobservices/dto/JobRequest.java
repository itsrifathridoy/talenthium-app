package tech.talenthium.jobservices.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequest {
//    recruiter id will be fetched from header
//    @NotNull(message = "Recruiter ID is required")
//    @Positive(message = "Recruiter ID must be greater than 0")
//    private Long recruiterId;
    @NotBlank(message = "Job title is required")
    private String title;
    @NotBlank(message = "Company name is required")
    private String companyName;
    @NotBlank(message = "Location is required")
    private String location;
    @NotBlank(message = "Job type is required")
    private String jobType;
    @NotBlank(message = "Salary range is required")
    private String salaryRange;
    @NotBlank(message = "Working hours is required")
    private String workingHours;
    @NotBlank(message = "Job description is required")
    private String descriptionMarkdown;
    @NotBlank(message = "Skills are required")
    private String skills; // can be comma-separated for faster querying
    @NotBlank(message = "Experience level is required")
    private String experienceLevel;
    @NotNull(message = "Expiration date is required")
    private LocalDateTime expiresAt;
}
