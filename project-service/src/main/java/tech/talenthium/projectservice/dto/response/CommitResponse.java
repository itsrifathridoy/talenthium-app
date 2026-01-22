package tech.talenthium.projectservice.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CommitResponse {
    
    @JsonProperty("sha")
    private String commitSha;

    @JsonProperty("message")
    private String commitMessage;

    @JsonProperty("author")
    private CommitAuthor author;

    @JsonProperty("committed_date")
    private Instant committedDate;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CommitAuthor {
        private String name;
        private String email;
        private String username;
    }

    public String getShortSha() {
        return commitSha != null && commitSha.length() >= 7 ? commitSha.substring(0, 7) : commitSha;
    }
}
