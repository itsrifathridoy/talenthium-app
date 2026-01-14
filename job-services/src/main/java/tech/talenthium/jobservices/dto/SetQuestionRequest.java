
    // tech.talenthium.jobservices.dto.SetQuestionRequest.java
package tech.talenthium.jobservices.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;
import tech.talenthium.jobservices.entity.InterviewRound;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SetQuestionRequest {
    private InterviewRound.Round round;
    private JsonNode questions;

//    public enum QuestionRound {
//        SCREENING, AI, TECHNICAL
//    }
}


