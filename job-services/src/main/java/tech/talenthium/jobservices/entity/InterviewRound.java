package tech.talenthium.jobservices.entity;

import jakarta.persistence.*;
import lombok.*;
import tech.talenthium.jobservices.mapper.CandidateResponseConverter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "interview_round")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRound {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Round round = Round.SCREENING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.NOT_COMPLETED;

    @Builder.Default
    private Duration duration = Duration.ofHours(1); //Default 1 hour if needed changeable

    private LocalDateTime interviewDate; //interview date

    public enum Round {
        SCREENING, AI, TECHNICAL, SELECTED
    }
    public enum Status {
        DISQUALIFY, COMPLETED, NOT_COMPLETED
    }
    //Interview time,DURATION, cuurent status
}
