package tech.talenthium.projectservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitSummaryResponse {
    private String commitHash;
    private String summary;
    private List<String> changes;
    private String impact;   // Low | Medium | High
    private String type;     // Feature | Fix | Refactor | Test | Docs | Chore | Style
    private int filesChanged;
    private int totalAdditions;
    private int totalDeletions;
}
