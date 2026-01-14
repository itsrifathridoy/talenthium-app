package tech.talenthium.jobservices.mapper;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coding implements Question {
    private String question;
    private String language;   // "C", "C++", "Java", etc.
    private String ans_code; // actual code
}
