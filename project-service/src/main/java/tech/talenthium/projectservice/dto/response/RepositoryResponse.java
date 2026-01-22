package tech.talenthium.projectservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for GitHub repository information.
 * Contains essential repository details for displaying in UI.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryResponse {
    private long id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("full_name")
    private String fullName;
    
    @JsonProperty("owner")
    private OwnerInfo owner;
    
    @JsonProperty("html_url")
    private String htmlUrl;
    
    private String description;
    
    @JsonProperty("private")
    private boolean isPrivate;
    
    @JsonProperty("language")
    private String language;
    
    @JsonProperty("stargazers_count")
    private int starsCount;
    
    @JsonProperty("forks_count")
    private int forksCount;
    
    @JsonProperty("default_branch")
    private String defaultBranch;

    /**
     * Owner information for a repository.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OwnerInfo {
        private long id;
        
        @JsonProperty("login")
        private String login;
        
        @JsonProperty("avatar_url")
        private String avatarUrl;
        
        @JsonProperty("type")
        private String type;
    }
}
