package tech.talenthium.jobservices.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recruiterId;

    // Job title
    @Column(nullable = false)
    private String title;

    // Company name
    @Column(nullable = false)
    private String companyName;

    // Location
    private String location;

    // Job type (e.g., Full-time, Part-time, Remote)
    private String jobType;

    // Salary range
    private String salaryRange;

    // Salary range
    private String workingHours;

    // Markdown content for job description
//    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String descriptionMarkdown;

    // Skills required
    private String skills; // can be comma-separated for faster querying

    // Experience level (e.g., Junior, Mid, Senior)
    private String experienceLevel;

    // When the job was posted
    @Builder.Default
    private LocalDateTime postedAt=LocalDateTime.now();

    // When the job will expire
    private LocalDateTime expiresAt;

    // Whether the job is active
    @Builder.Default
    private boolean active = true;

    public boolean isActive() {
        if(active && (expiresAt == null || expiresAt.isAfter(getExpiresAt())))this.active=false;
        return active;
    }
}
