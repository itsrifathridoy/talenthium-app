package tech.talenthium.jobservices.mapper;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MCQ implements Question {
    private String question;
    private List<String> options;  // 4 possible answers
    private String correct_answer;  // the right one
//    private String candidateAnswer; // what candidate picked
}