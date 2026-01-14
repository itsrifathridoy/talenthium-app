package tech.talenthium.jobservices.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
// This will be used to send the next round details
// to the selected candidates
// selected_ids, interviewDate, duration
// By the recruiter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNextRound {
    @NotEmpty
    private Long jobId;
    @NotEmpty
    private List<Long> selected_ids;
    @NotEmpty
    private LocalDateTime interviewDate;
    @NotEmpty
    private Duration duration;
}

