package tech.talenthium.projectservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitFetchEvent implements Serializable {
    private Long projectId;
    private Long userId;
    private String projectName;
    private String gitLink;
    private String defaultBranch;
}
