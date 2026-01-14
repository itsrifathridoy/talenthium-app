package tech.talenthium.jobservices.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateRoundResponse {
    @NotEmpty
    private Long interviewRoundId;
    private Map<String, Object> candidateResponses;
    private int obtainedMarks;
}
