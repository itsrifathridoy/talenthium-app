package tech.talenthium.jobservices.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import tech.talenthium.jobservices.mapper.JsonNodeConverter;
import tech.talenthium.jobservices.mapper.QuestionResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewRound.Round round = InterviewRound.Round.SCREENING;


    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonNodeConverter.class)
    private JsonNode questions;

//    @Lob
//    @Column(columnDefinition = "TEXT")
//    @Convert(converter = QuestionResponse.class)
//    private List<QuestionType> questions=  new ArrayList<>();

//    public enum Round {
//        SCREENING, AI, TECHNICAL
//    }
    public enum QuestionType {
        MCQ, Descriptive, Coding
    }
}
