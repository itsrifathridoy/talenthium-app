package tech.talenthium.jobservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.talenthium.jobservices.entity.InterviewRound;

import java.time.Duration;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRoundResponse {
    private Long id;
    private Long jobId;
    private String round;
    private LocalDateTime interviewDate;
    private Duration duration;
    private LocalDateTime appliedAt;
    private LocalDateTime createdAt;
    private InterviewRound.Round currentRound;
    private InterviewRound.Status status;
}

