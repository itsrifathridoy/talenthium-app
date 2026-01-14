package tech.talenthium.jobservices.entity;

import jakarta.persistence.*;
import lombok.*;
import tech.talenthium.jobservices.mapper.CandidateResponseConverter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "candidate_response")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private InterviewRound interviewRound;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewRound.Round round= InterviewRound.Round.SCREENING;

    //    @Lob
    @Column(columnDefinition = "TEXT")
    @Convert(converter = CandidateResponseConverter.class)
    private Map<String, Object> candidateResponses = new HashMap<>();

    @Column(nullable = false)
    @Builder.Default
    private int obtainedMarks = 0;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime attempted = LocalDateTime.now();

    public enum Round {
        SCREENING, AI, TECHNICAL, SELECTED
    }
}
