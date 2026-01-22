package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.projectservice.config.RabbitMQConfig;
import tech.talenthium.projectservice.dto.request.ProjectCreateRequest;
import tech.talenthium.projectservice.dto.response.FileContentResponse;
import tech.talenthium.projectservice.dto.response.ProjectDetailResponse;
import tech.talenthium.projectservice.entity.*;
import tech.talenthium.projectservice.event.CommitFetchEvent;
import tech.talenthium.projectservice.repository.ProjectRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final GitHubService gitHubService;
    private final GithubInstallService githubInstallService;
    private final GitHubAppAuthService gitHubAppAuthService;
    private final ContributionService contributionService;
    private final UserService userService;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Project createNewProject(ProjectCreateRequest body, Long userId) {
        log.info("Creating new project: {}", body.getName());
        Project project = projectRepository.save(body.toEntity(userId));

        // Queue commit fetching asynchronously
        try {
            CommitFetchEvent event = CommitFetchEvent.builder()
                    .projectId(project.getId())
                    .userId(userId)
                    .projectName(project.getName())
                    .gitLink(project.getGitLink())
                    .defaultBranch(project.getDefaultBranch())
                    .build();
            
            rabbitTemplate.convertAndSend(RabbitMQConfig.COMMIT_FETCH_QUEUE, event);
            log.info("Queued commit fetch task for project: {} (ID: {})", project.getName(), project.getId());
        } catch (Exception e) {
            log.warn("Failed to queue commit fetch for project {}: {}", project.getName(), e.getMessage());
            // Don't fail project creation if queueing fails
        }

        return project;
    }

    /**
     * Get all projects.
     *
     * @return List of all projects
     */
    public List<Project> getAllProjects() {
        log.info("Fetching all projects");
        return projectRepository.findAll();
    }

    /**
     * Get projects by owner/user ID.
     *
     * @param ownerId - User ID who owns the projects
     * @return List of projects owned by the user
     */
    public List<Project> getProjectsByOwner(Long ownerId) {
        log.info("Fetching projects for owner {}", ownerId);
        return projectRepository.findByOwnerId(ownerId);
    }

    /**
     * Fetches file content from a GitHub repository for a specific user.
     *
     * @param userId       - The ID of the user who has the GitHub app installed
     * @param repoFullName - Repository full name (owner/repo)
     * @param filePath     - Path to the file in the repository
     * @return FileContentResponse with the file content
     */
    public FileContentResponse getRepositoryFileContent(Long userId, String repoFullName, String filePath) {
        try {
            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Fetch the file content
            FileContentResponse fileContent = gitHubService.getFileContent(repoFullName, filePath, installationToken);

            log.info("Successfully fetched file {} from repository {}", filePath, repoFullName);
            return fileContent;
        } catch (Exception e) {
            log.error("Error fetching file content for user {} from repo {}", userId, repoFullName, e);
            throw new RuntimeException("Failed to fetch file content: " + e.getMessage(), e);
        }
    }

    /**
     * Lists all repositories accessible by the user's GitHub App installation.
     * Useful for debugging 404 errors.
     *
     * @param userId - The ID of the user who has the GitHub app installed
     * @return JsonNode containing list of accessible repositories
     */
    public JsonNode listAccessibleRepositories(Long userId) {
        try {
            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // List repositories
            JsonNode repos = gitHubService.listInstallationRepos(installationToken);
            log.info("Listed {} repositories for user {}",
                    repos.has("repositories") ? repos.get("repositories").size() : 0,
                    userId);

            return repos;
        } catch (Exception e) {
            log.error("Error listing repositories for user {}", userId, e);
            throw new RuntimeException("Failed to list repositories: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a specific repository is accessible by the user's GitHub App installation.
     *
     * @param userId       - The ID of the user who has the GitHub app installed
     * @param repoFullName - Repository full name (owner/repo)
     * @return true if accessible, false otherwise
     */
    public boolean checkRepositoryAccess(Long userId, String repoFullName) {
        try {
            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Check access
            boolean canAccess = gitHubService.canAccessRepository(repoFullName, installationToken);
            log.info("Repository {} access check for user {}: {}", repoFullName, userId, canAccess);

            return canAccess;
        } catch (Exception e) {
            log.error("Error checking repository access for user {} on repo {}", userId, repoFullName, e);
            return false;
        }
    }

    /**
     * Gets directory contents (files and folders) at a specific path.
     *
     * @param userId       - The ID of the user who has the GitHub app installed
     * @param repoFullName - Repository full name (owner/repo)
     * @param path         - Directory path (empty string or null for root)
     * @return JsonNode array containing files and directories
     */
    public JsonNode getDirectoryContents(Long userId, String repoFullName, String path) {
        try {
            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Get directory contents
            JsonNode contents = gitHubService.getDirectoryContents(repoFullName, path, installationToken);
            log.info("Successfully fetched directory contents for {} at path: {}", repoFullName, path);

            return contents;
        } catch (Exception e) {
            log.error("Error fetching directory contents for user {} from repo {} at path {}", userId, repoFullName, path, e);
            throw new RuntimeException("Failed to fetch directory contents: " + e.getMessage(), e);
        }
    }

    /**
     * Gets the full repository tree (all files and folders recursively).
     *
     * @param userId       - The ID of the user who has the GitHub app installed
     * @param repoFullName - Repository full name (owner/repo)
     * @param branch       - Branch name (optional, defaults to "main")
     * @return JsonNode containing the recursive tree structure
     */
    public JsonNode getRepositoryTree(Long userId, String repoFullName, String branch) {
        try {
            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Get repository tree
            JsonNode tree = gitHubService.getRepositoryTree(repoFullName, branch, installationToken);
            log.info("Successfully fetched repository tree for {} (branch: {})", repoFullName, branch);

            return tree;
        } catch (Exception e) {
            log.error("Error fetching repository tree for user {} from repo {}", userId, repoFullName, e);
            throw new RuntimeException("Failed to fetch repository tree: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches blob content from a GitHub repository using the blob SHA.
     * Blobs can be retrieved from the repository tree response.
     *
     * @param userId       - The ID of the user who has the GitHub app installed
     * @param repoFullName - Repository full name (owner/repo)
     * @param sha          - SHA of the blob to fetch
     * @return FileContentResponse with the blob content
     */
    public FileContentResponse getBlobContent(Long userId, String repoFullName, String sha) {
        try {
            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Fetch the blob content
            FileContentResponse blobContent = gitHubService.getBlobContent(repoFullName, sha, installationToken);

            log.info("Successfully fetched blob {} from repository {}", sha, repoFullName);
            return blobContent;
        } catch (Exception e) {
            log.error("Error fetching blob content for user {} from repo {}", userId, repoFullName, e);
            throw new RuntimeException("Failed to fetch blob content: " + e.getMessage(), e);
        }
    }

    /**
     * Check if user has capability to create projects.
     * User must have linked their GitHub username to create projects.
     *
     * @param userId - User ID to check
     * @return Map with capability status
     */
    public Map<String, Object> checkProjectCreationCapability(Long userId) {
        log.info("Checking project creation capability for user {}", userId);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);

        try {
            User userData = userService.getUserById(userId);

            boolean hasGithubUsername = userData.getGithubUsername() != null && !userData.getGithubUsername().isBlank();

            response.put("canCreateProject", hasGithubUsername);
            response.put("hasGithubUsername", hasGithubUsername);
            response.put("username", userData.getUsername());
            response.put("email", userData.getEmail());

            if (hasGithubUsername) {
                response.put("githubUsername", userData.getGithubUsername());
                response.put("message", "User is ready to create projects");
                response.put("code", "READY");
            } else {
                response.put("message", "User must link GitHub account to create projects");
                response.put("code", "GITHUB_NOT_LINKED");
            }

            return response;
        } catch (RuntimeException e) {
            log.warn("User not found: {}", userId);
            response.put("canCreateProject", false);
            response.put("hasGithubUsername", false);
            response.put("message", "User not found in database");
            response.put("code", "USER_NOT_FOUND");
            return response;
        } catch (Exception e) {
            log.error("Error checking project creation capability for user {}: {}", userId, e.getMessage(), e);
            response.put("canCreateProject", false);
            response.put("message", "Error checking capability: " + e.getMessage());
            response.put("code", "ERROR");
            return response;
        }
    }

    /**
     * Get full project details for viewing.
     * Includes project info, contributors, contributions, tech stack, and stats.
     * Uses dummy data for fields not yet implemented.
     *
     * @param projectId - Project ID
     * @return ProjectDetailResponse with comprehensive project details
     */
    public ProjectDetailResponse getProjectDetails(Long projectId) {
        log.info("Fetching full details for project {}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));

        try {
            User owner = userService.getUserById(project.getOwnerId());

            // Build owner info
            ProjectDetailResponse.OwnerInfo ownerInfo = ProjectDetailResponse.OwnerInfo.builder()
                    .id(owner.getUserId())
                    .name(owner.getUsername())
                    .email(owner.getEmail())
                    .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + owner.getUsername())
                    .role("Owner")
                    .build();

            // Build contributors info
            List<ProjectDetailResponse.ContributorInfo> contributorsList = project.getContributors().stream()
                    .map(c -> {
                        // Check if contributor is a registered user
                        User user = userService.getUserByGithubUsername(c.getGithubUsername());
                        String profileLink = user != null 
                                ? "http://localhost:3000/profile/" + user.getUserId()
                                : "https://github.com/" + c.getGithubUsername();
                        
                        return ProjectDetailResponse.ContributorInfo.builder()
                                .id(c.getContributorId())
                                .name(c.getName())
                                .email(c.getEmail())
                                .avatar(c.getAvatarUrl())
                                .role(c.getRole())
                                .contributions((int) project.getContributions().stream()
                                        .filter(con -> con.getContributor().getContributorId().equals(c.getContributorId()))
                                        .count())
                                .githubUsername(c.getGithubUsername())
                                .profileLink(profileLink)
                                .build();
                    })
                    .collect(Collectors.toList());

            // Build contributions info
            List<ProjectDetailResponse.ContributionInfo> contributionsList = project.getContributions().stream()
                    .map(c -> ProjectDetailResponse.ContributionInfo.builder()
                            .id(c.getId())
                            .date(c.getCommittedDate().toString())
                            .type(c.getType())
                            .description(c.getCommitMessage())
                            .author(c.getContributor().getName())
                            .branch(c.getBranch())
                            .commits(1)
                            .hash(c.getCommitSha())
                            .build())
                    .collect(Collectors.toList());

            // Build deployments info
            List<ProjectDetailResponse.DeploymentInfo> deploymentsList = project.getDeployments().stream()
                    .map(d -> ProjectDetailResponse.DeploymentInfo.builder()
                            .id(d.getId())
                            .status(d.getStatus().toString())
                            .log(d.getLog())
                            .startedAt(d.getStartedAt() != null ? d.getStartedAt().toString() : null)
                            .completedAt(d.getCompletedAt() != null ? d.getCompletedAt().toString() : null)
                            .build())
                    .collect(Collectors.toList());

            // Dummy stats (will be implemented later)
            ProjectDetailResponse.ProjectStats stats = ProjectDetailResponse.ProjectStats.builder()
                    .stars((int) (Math.random() * 5000))
                    .forks((int) (Math.random() * 500))
                    .watchers((int) (Math.random() * 1000))
                    .build();

            // Dummy tags (will be fetched from project_tags table later)
            List<String> tags = new ArrayList<>(Arrays.asList("Open Source", "Web", "Development"));

            // Dummy tech stack (will be fetched from project_tech_stacks table later)
            List<String> techStack = new ArrayList<>(Arrays.asList("Next.js", "TypeScript", "Node.js", "PostgreSQL", "TailwindCSS"));

            // Determine status based on privacy and other factors
            String status = "Active";
            if (project.getPrivacy().toString().equals("PRIVATE")) {
                status = "Private";
            }

            return ProjectDetailResponse.builder()
                    .id(project.getId())
                    .title(project.getName())
                    .tagline(project.getTagline())
                    .shortDescription(project.getShortDescription())
                    .detailedDescription(project.getDetailedDescription())
                    .githubUrl(project.getGitLink())
                    .liveUrl(project.getLiveLink())
                    .status(status)
                    .privacy(project.getPrivacy().toString())
                    .owner(ownerInfo)
                    .tags(tags)
                    .techStack(techStack)
                    .stats(stats)
                    .contributors(contributorsList)
                    .contributions(contributionsList)
                    .deployments(deploymentsList)
                    .build();
        } catch (RuntimeException e) {
            log.error("Error fetching project details for project {}: {}", projectId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch project details: " + e.getMessage(), e);
        }
    }

    /**
     * Get commit diff/changes for a specific commit hash.
     *
     * @param userId - User ID to authenticate
     * @param projectId - Project ID
     * @param commitHash - Commit SHA/hash
     * @return JsonNode containing commit details and diff
     */
    public JsonNode getCommitDiff(Long userId, Long projectId, String commitHash) {
        log.info("Fetching commit diff for project {} and commit {}", projectId, commitHash);

        try {
            // Get project to retrieve repository name
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));

            // Get the GitHub installation for the user
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

            // Create installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Extract repo full name from git link
            String repoFullName = extractRepoFullName(project.getGitLink());

            // Fetch commit diff from GitHub
            JsonNode commitDiff = gitHubService.getCommitDiff(repoFullName, commitHash, installationToken);

            log.info("Successfully fetched commit diff for commit {}", commitHash);
            return commitDiff;
        } catch (Exception e) {
            log.error("Error fetching commit diff for project {} and commit {}: {}", projectId, commitHash, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch commit diff: " + e.getMessage(), e);
        }
    }

    /**
     * Extract repository full name (owner/repo) from GitHub URL.
     *
     * @param gitLink - GitHub repository URL
     * @return Repository full name (owner/repo)
     */
    private String extractRepoFullName(String gitLink) {
        // Example: https://github.com/owner/repo.git or https://github.com/owner/repo
        String url = gitLink.replace(".git", "");
        String[] parts = url.split("/");
        if (parts.length >= 2) {
            return parts[parts.length - 2] + "/" + parts[parts.length - 1];
        }
        throw new RuntimeException("Invalid GitHub URL format: " + gitLink);
    }
}
