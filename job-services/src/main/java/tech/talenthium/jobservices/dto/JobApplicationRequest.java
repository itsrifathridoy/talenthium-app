package tech.talenthium.jobservices.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import tech.talenthium.jobservices.entity.Job;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationRequest {
    @NotNull(message = "Job ID is required")
    @Positive(message = "Job ID must be greater than 0")
    private Long jobId;

    @NotNull(message = "Candidate ID is required")
    @Positive(message = "Candidate ID must be greater than 0")
    private Long candidateId;
}