package tech.talenthium.projectservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitRequest {
    private String commitMessage;
    private String branch;
    private Map<String, String> files;
    private String authorName;
    private String authorEmail;
}
