package tech.talenthium.jobservices.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.entity.JobApplication;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {
    private Long id; //application id
    private Long jobId;
    private Long candidateId;
    private String status;
    private Long recruiterId;
    private String title;
    private String companyName;
    private String location;
    private String jobType;
    private String salaryRange;
    private String workingHours;
    private String descriptionMarkdown;
    private String skills; // can be comma-separated for faster querying
    // Experience level (e.g., Junior, Mid, Senior)
    private String experienceLevel;
    // When the job was posted
    private LocalDateTime postedAt;
    // When the job will expire
    private LocalDateTime expiresAt;
    // Whether the job is active
    private boolean active;
    private LocalDateTime appliedAt;
    private LocalDateTime lastUpdated;
    private double score=0;
}
