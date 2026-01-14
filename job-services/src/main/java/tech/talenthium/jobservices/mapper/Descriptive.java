package tech.talenthium.jobservices.mapper;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Descriptive implements Question {
    private String question;
    private String answer;  // Exact ans
}