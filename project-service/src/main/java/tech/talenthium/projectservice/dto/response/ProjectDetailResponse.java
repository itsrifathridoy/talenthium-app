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
public class ProjectDetailResponse {
    private Long id;
    private String title;
    private String tagline;
    private String shortDescription;
    private String detailedDescription;
    private String githubUrl;
    private String liveUrl;
    private String status;
    private String privacy;
    
    private OwnerInfo owner;
    private List<String> tags;
    private List<String> techStack;
    private ProjectStats stats;
    private List<ContributorInfo> contributors;
    private List<ContributionInfo> contributions;
    private List<DeploymentInfo> deployments;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerInfo {
        private Long id;
        private String name;
        private String email;
        private String avatar;
        private String role;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectStats {
        private Integer stars;
        private Integer forks;
        private Integer watchers;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContributorInfo {
        private Long id;
        private String name;
        private String email;
        private String avatar;
        private String role;
        private Integer contributions;
        private String githubUsername;
        private String profileLink;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContributionInfo {
        private Long id;
        private String date;
        private String type;
        private String description;
        private String author;
        private Integer commits;
        private String branch;
        private String hash;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeploymentInfo {
        private Long id;
        private String status;
        private String log;
        private String startedAt;
        private String completedAt;
    }
}
