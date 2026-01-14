package tech.talenthium.jobservices.dto;

import jakarta.persistence.*;
import lombok.*;
import tech.talenthium.jobservices.entity.InterviewRound;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.entity.JobApplication;
import tech.talenthium.jobservices.entity.Question;
import tech.talenthium.jobservices.mapper.QuestionResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {

    private Job job;

    private List<Question.QuestionType> questions;

    private InterviewRound.Round round;

    public enum QuestionType {
        MCQ, Descriptive, Coding
    }
}
