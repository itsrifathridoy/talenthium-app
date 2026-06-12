package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.projectservice.config.RabbitMQConfig;
import tech.talenthium.projectservice.dto.request.ProjectCreateRequest;
import tech.talenthium.projectservice.dto.response.FileContentResponse;
import tech.talenthium.projectservice.dto.response.ProjectDetailResponse;
import tech.talenthium.projectservice.entity.*;
import tech.talenthium.projectservice.event.CommitFetchEvent;
import tech.talenthium.projectservice.repository.ContributionRepository;
import tech.talenthium.projectservice.repository.ContributorRepository;
import tech.talenthium.projectservice.repository.ProjectRepository;
import tech.talenthium.projectservice.repository.UserRepository;

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
    private final ContributionRepository contributionRepository;
    private final ContributorRepository contributorRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;
    private final DokployService dokployService;

    @Autowired
    private EntityManager entityManager;

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
     * Clears existing tech stack for the project and returns repo full name for async re-generation.
     */
    @Transactional
    public String prepareTechStackGeneration(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        project.getTechStack().clear();
        projectRepository.save(project);
        String url = project.getGitLink().replace(".git", "");
        String[] parts = url.split("/");
        if (parts.length < 2) throw new RuntimeException("Invalid GitHub URL: " + project.getGitLink());
        return parts[parts.length - 2] + "/" + parts[parts.length - 1];
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

    public List<Map<String, Object>> searchGithubUsers(String query) {
        return userRepository.searchUsersWithGithub(query).stream()
                .map(u -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("userId", u.getUserId());
                    m.put("name", u.getName());
                    m.put("username", u.getUsername());
                    m.put("githubUsername", u.getGithubUsername());
                    m.put("avatarUrl", "https://github.com/" + u.getGithubUsername() + ".png");
                    return m;
                })
                .toList();
    }

    @Transactional
    public void addContributor(Long projectId, String githubUsername, Long requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (!project.getOwnerId().equals(requesterId)) {
            throw new RuntimeException("Forbidden: only the project owner can add contributors");
        }

        boolean alreadyExists = contributorRepository
                .findByProjectAndGithubUsername(project, githubUsername).isPresent();
        if (alreadyExists) {
            throw new RuntimeException("User is already a contributor");
        }

        User user = userRepository.findByGithubUsername(githubUsername)
                .orElseThrow(() -> new RuntimeException("No user found with GitHub username: " + githubUsername));

        contributorRepository.save(Contributor.builder()
                .project(project)
                .name(user.getName())
                .githubUsername(user.getGithubUsername())
                .email(user.getEmail())
                .avatarUrl("https://github.com/" + user.getGithubUsername() + ".png")
                .role("Contributor")
                .build());

        log.info("Added contributor {} to project {}", githubUsername, projectId);

        // Invite as GitHub repository collaborator (best-effort — doesn't roll back the DB save on failure)
        try {
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(requesterId);
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);
            String repoFullName = extractRepoFullName(project.getGitLink());
            gitHubService.addRepositoryCollaborator(repoFullName, githubUsername, "push", installationToken);
        } catch (Exception e) {
            log.warn("GitHub collaborator invite failed for {} on project {}: {}", githubUsername, projectId, e.getMessage());
        }
    }

    @Transactional
    public void removeContributorAccess(Long projectId, Long contributorId, Long requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        if (!project.getOwnerId().equals(requesterId)) {
            throw new RuntimeException("Forbidden: only the project owner can manage contributors");
        }
        Contributor contributor = contributorRepository.findById(contributorId)
                .orElseThrow(() -> new RuntimeException("Contributor not found: " + contributorId));
        contributor.setActive(false);
        contributorRepository.save(contributor);
        log.info("Removed access for contributor {} on project {}", contributorId, projectId);

        // Remove from GitHub repository collaborators
        try {
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(requesterId);
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);
            String repoFullName = extractRepoFullName(project.getGitLink());
            gitHubService.removeRepositoryCollaborator(repoFullName, contributor.getGithubUsername(), installationToken);
        } catch (Exception e) {
            log.warn("GitHub collaborator removal failed for contributor {} on project {}: {}", contributorId, projectId, e.getMessage());
        }
    }

    @Transactional
    public void deleteContributor(Long projectId, Long contributorId, Long requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        if (!project.getOwnerId().equals(requesterId)) {
            throw new RuntimeException("Forbidden: only the project owner can manage contributors");
        }
        Contributor contributor = contributorRepository.findById(contributorId)
                .orElseThrow(() -> new RuntimeException("Contributor not found: " + contributorId));
        long count = contributionRepository.countByContributor(contributor);
        if (count > 0) {
            throw new RuntimeException("Cannot delete contributor with " + count + " existing contribution(s)");
        }
        String githubUsername = contributor.getGithubUsername();
        contributorRepository.delete(contributor);
        log.info("Deleted contributor {} from project {}", contributorId, projectId);

        // Remove from GitHub repository collaborators
        try {
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(requesterId);
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);
            String repoFullName = extractRepoFullName(project.getGitLink());
            gitHubService.removeRepositoryCollaborator(repoFullName, githubUsername, installationToken);
        } catch (Exception e) {
            log.warn("GitHub collaborator removal failed for contributor {} on project {}: {}", contributorId, projectId, e.getMessage());
        }
    }

    public List<Project> getContributedProjects(Long userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        if (user.getGithubUsername() == null) return List.of();
        return contributorRepository.findByGithubUsername(user.getGithubUsername())
                .stream()
                .map(Contributor::getProject)
                .filter(p -> !p.getOwnerId().equals(userId))
                .distinct()
                .toList();
    }

    public void syncContributions(Long projectId, Long userId) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);
        long installationId = Long.parseLong(installation.getInstallationId());
        String appJwt = gitHubAppAuthService.generateAppJWT();
        String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

        log.info("Manual contribution sync triggered for project {} by user {}", projectId, userId);
        contributionService.fetchAndStoreCommits(project, installationToken, project.getDefaultBranch());
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
            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);

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
            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);

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
            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);

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
            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);

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
            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);

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
                            .authorAvatar(c.getContributor().getAvatarUrl())
                            .authorRole(c.getContributor().getRole())
                            .branch(c.getBranch())
                            .commits(1)
                            .hash(c.getCommitSha())
                            .aiSummary(c.getAiSummary())
                            .aiChanges(c.getAiChanges())
                            .aiImpact(c.getAiImpact())
                            .aiType(c.getAiType())
                            .aiFilesChanged(c.getAiFilesChanged())
                            .aiAdditions(c.getAiAdditions())
                            .aiDeletions(c.getAiDeletions())
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
                            .branch(d.getBranch())
                            .commitHash(d.getCommitHash())
                            .title(d.getTitle())
                            .dokployDeploymentId(d.getDokployDeploymentId())
                            .dokployApplicationId(d.getDokployApplicationId())
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

            List<String> techStack = project.getTechStack().stream()
                    .map(ProjectTechStack::getTechnology)
                    .collect(Collectors.toList());

            // Determine status based on privacy and other factors
            String status = "Active";
            if (project.getPrivacy().toString().equals("PRIVATE")) {
                status = "Private";
            }

            return ProjectDetailResponse.builder()
                    .id(project.getId())
                    .ownerId(project.getOwnerId())
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
                    .webhookUrl(project.getDokployRefreshToken() != null
                            ? dokployService.buildWebhookUrl(project.getDokployRefreshToken()) : null)
                    .deployPublicKey(project.getDokployPublicKey())
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

            String repoFullName = extractRepoFullName(project.getGitLink());
            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);

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
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (!project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Forbidden: you do not own this project");
        }

        // 1. Delete contributions (and their @ElementCollection tables) explicitly
        contributionService.deleteAllByProject(project);

        // 2. Flush pending DELETEs to DB and clear session to avoid stale entity state.
        //    Without this, Hibernate may try to re-delete already-removed contributions
        //    when cascading from the project, causing FK constraint violations.
        entityManager.flush();
        entityManager.clear();

        // 3. Reload project fresh (contributions collection is now empty in DB)
        //    and delete — cascade handles contributors, deployments, join tables.
        projectRepository.findById(projectId).ifPresent(projectRepository::delete);
        log.info("Deleted project {} by user {}", projectId, userId);
    }

    public Map<String, Object> commitAndPush(
            Long userId,
            String repoOwner,
            String repoName,
            String commitMessage,
            String branch,
            Map<String, String> files,
            String authorName,
            String authorEmail) throws Exception {

        String repoFullName = repoOwner + "/" + repoName;
        String installationToken = resolveInstallationToken(repoOwner, userId);
        return gitHubService.commitFiles(repoFullName, branch, commitMessage, files, authorName, authorEmail, installationToken);
    }

    /**
     * Resolves an installation token scoped to the repo owner's GitHub App installation.
     * This allows contributors (and any authenticated user) to access repos owned by
     * someone else, as long as the owner installed the GitHub App on that repo.
     *
     * Falls back to the requesting user's installation if the owner's is not found.
     */
    private String resolveInstallationToken(String repoOwnerGithubUsername, Long fallbackUserId) throws Exception {
        if (repoOwnerGithubUsername != null && !repoOwnerGithubUsername.isBlank()) {
            Optional<User> ownerOpt = userRepository.findByGithubUsername(repoOwnerGithubUsername);
            if (ownerOpt.isPresent()) {
                try {
                    GithubAppInstallation inst = githubInstallService.getGithubInstallation(ownerOpt.get().getUserId());
                    String appJwt = gitHubAppAuthService.generateAppJWT();
                    log.debug("Using repo owner '{}' installation for GitHub access", repoOwnerGithubUsername);
                    return gitHubService.createInstallationToken(Long.parseLong(inst.getInstallationId()), appJwt);
                } catch (Exception e) {
                    log.warn("Repo owner '{}' has no GitHub App installation, falling back to requester {}: {}",
                            repoOwnerGithubUsername, fallbackUserId, e.getMessage());
                }
            }
        }
        GithubAppInstallation inst = githubInstallService.getGithubInstallation(fallbackUserId);
        String appJwt = gitHubAppAuthService.generateAppJWT();
        return gitHubService.createInstallationToken(Long.parseLong(inst.getInstallationId()), appJwt);
    }

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
