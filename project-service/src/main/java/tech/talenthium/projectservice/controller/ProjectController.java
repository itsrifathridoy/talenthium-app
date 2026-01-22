package tech.talenthium.projectservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.talenthium.projectservice.dto.request.ProjectCreateRequest;
import tech.talenthium.projectservice.dto.response.FileContentResponse;
import tech.talenthium.projectservice.dto.response.ProjectDetailResponse;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.service.ProjectService;
import tech.talenthium.projectservice.util.GitHubTreeFormatter;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final GitHubTreeFormatter treeFormatter;

    @PostMapping("/create")
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectCreateRequest request, @RequestHeader("X-USERID") Long userId) {
        log.info("Creating new project {}", request);
        try {
            Project project = projectService.createNewProject(request, userId);
            return ResponseEntity.ok(project);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Constraint violation while creating project for user {}: {}", userId, ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Duplicate or invalid project data. Please check project name and repository uniqueness.")
            );
        }
    }

    /**
     * Get all projects.
     *
     * @return List of all projects
     * <p>
     * Example: GET /api/projects
     */
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        log.info("Fetching all projects");
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects by authenticated user.
     *
     * @param userId - User ID from authentication context
     * @return List of projects owned by the authenticated user
     * <p>
     * Example: GET /api/projects/my
     */
    @GetMapping("/my")
    public ResponseEntity<List<Project>> getMyProjects(@RequestHeader("X-USERID") Long userId) {
        log.info("Fetching projects for user {}", userId);
        List<Project> projects = projectService.getProjectsByOwner(userId);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get full project details for viewing.
     * Includes project info, contributors, contributions, tech stack, and stats.
     *
     * @param projectId - Project ID
     * @return ProjectDetailResponse with comprehensive project details
     * <p>
     * Example: GET /api/projects/{id}/details
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<ProjectDetailResponse> getProjectDetails(@PathVariable("id") Long projectId) {
        log.info("Fetching full details for project {}", projectId);
        ProjectDetailResponse projectDetails = projectService.getProjectDetails(projectId);
        return ResponseEntity.ok(projectDetails);
    }

    /**
     * Fetch file content from a GitHub repository.
     *
     * @param userId   - User ID from header (X-USERID)
     * @param repoName - Repository full name (owner/repo)
     * @param filePath - Path to the file in the repository (URL encoded)
     * @return FileContentResponse with the decoded file content
     * <p>
     * Example: GET /api/projects/github/content/owner/repo?filePath=path/to/package.json
     */
    @GetMapping("/github/content/{repoOwner}/{repoName}")
    public ResponseEntity<FileContentResponse> getFileContent(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName,
            @RequestParam String filePath) {

        log.info("Fetching file {} from repository {}/{} for user {}", filePath, repoOwner, repoName, userId);

        String repoFullName = repoOwner + "/" + repoName;
        FileContentResponse fileContent = projectService.getRepositoryFileContent(userId, repoFullName, filePath);

        return ResponseEntity.ok(fileContent);
    }

    /**
     * List accessible repositories for debugging.
     * Shows which repositories the GitHub App installation has access to.
     *
     * @param userId - User ID from header (X-USERID)
     * @return JSON list of accessible repositories
     * <p>
     * Example: GET /api/projects/github/repositories
     */
    @GetMapping("/github/repositories")
    public ResponseEntity<JsonNode> listAccessibleRepositories(@RequestHeader("X-USERID") Long userId) {
        log.info("Listing accessible repositories for user {}", userId);
        JsonNode repositories = projectService.listAccessibleRepositories(userId);
        return ResponseEntity.ok(repositories);
    }

    /**
     * Check if a specific repository is accessible.
     * Useful for debugging 404 errors.
     *
     * @param userId    - User ID from header (X-USERID)
     * @param repoOwner - Repository owner
     * @param repoName  - Repository name
     * @return JSON with access status
     * <p>
     * Example: GET /api/projects/github/check-access/owner/repo
     */
    @GetMapping("/github/check-access/{repoOwner}/{repoName}")
    public ResponseEntity<?> checkRepositoryAccess(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName) {

        log.info("Checking access to repository {}/{} for user {}", repoOwner, repoName, userId);

        String repoFullName = repoOwner + "/" + repoName;
        boolean canAccess = projectService.checkRepositoryAccess(userId, repoFullName);

        return ResponseEntity.ok(java.util.Map.of(
                "repository", repoFullName,
                "accessible", canAccess,
                "message", canAccess
                        ? "GitHub App has access to this repository"
                        : "GitHub App does NOT have access to this repository. Please reinstall the app with access to this repo."
        ));
    }

    /**
     * Get directory contents (files and folders) at a specific path.
     * Returns an array of files and directories with their metadata.
     *
     * @param userId    - User ID from header (X-USERID)
     * @param repoOwner - Repository owner
     * @param repoName  - Repository name
     * @param path      - Directory path (optional, defaults to root)
     * @return JSON array with files and directories
     * <p>
     * Example: GET /api/projects/github/tree/owner/repo?path=src
     * Example: GET /api/projects/github/tree/owner/repo (for root directory)
     */
    @GetMapping("/github/tree/{repoOwner}/{repoName}")
    public ResponseEntity<JsonNode> getDirectoryContents(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName,
            @RequestParam(required = false, defaultValue = "") String path) {

        log.info("Fetching directory contents from {}/{} at path: {} for user {}",
                repoOwner, repoName, path.isEmpty() ? "root" : path, userId);

        String repoFullName = repoOwner + "/" + repoName;
        JsonNode contents = projectService.getDirectoryContents(userId, repoFullName, path);

        return ResponseEntity.ok(contents);
    }

    /**
     * Get the full repository tree (all files and folders recursively).
     * Returns the entire file structure of the repository.
     *
     * @param userId    - User ID from header (X-USERID)
     * @param repoOwner - Repository owner
     * @param repoName  - Repository name
     * @param branch    - Branch name (optional, auto-detects repository's default branch if not provided)
     * @return JSON with recursive tree structure
     * <p>
     * Example: GET /api/projects/github/tree-recursive/owner/repo
     * Example: GET /api/projects/github/tree-recursive/owner/repo?branch=develop
     */
    @GetMapping("/github/tree-recursive/{repoOwner}/{repoName}")
    public ResponseEntity<JsonNode> getRepositoryTree(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName,
            @RequestParam(required = false) String branch) {

        log.info("Fetching full repository tree from {}/{} (branch: {}) for user {}",
                repoOwner, repoName, branch != null ? branch : "default", userId);

        String repoFullName = repoOwner + "/" + repoName;
        JsonNode tree = projectService.getRepositoryTree(userId, repoFullName, branch);

        return ResponseEntity.ok(tree);
    }

    /**
     * Get formatted repository tree with custom API URLs for file access.
     * Returns hierarchical structure with directories and files.
     *
     * @param userId    - User ID from header (X-USERID)
     * @param repoOwner - Repository owner
     * @param repoName  - Repository name
     * @param branch    - Branch name (optional)
     * @param format    - Format type: "hierarchy" (default), "flat", "by-directory", or "nested"
     * @param request   - HTTP request to extract base URL
     * @return Formatted tree structure
     * <p>
     * Example: GET /api/projects/github/tree-formatted/owner/repo
     * Example: GET /api/projects/github/tree-formatted/owner/repo?format=flat
     * Example: GET /api/projects/github/tree-formatted/owner/repo?format=by-directory
     * Example: GET /api/projects/github/tree-formatted/owner/repo?format=nested
     */
    @GetMapping("/github/tree-formatted/{repoOwner}/{repoName}")
    public ResponseEntity<?> getFormattedRepositoryTree(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName,
            @RequestParam(required = false) String branch,
            @RequestParam(defaultValue = "hierarchy") String format,
            HttpServletRequest request) {

        log.info("Fetching formatted repository tree from {}/{} (format: {}) for user {}",
                repoOwner, repoName, format, userId);

        String repoFullName = repoOwner + "/" + repoName;
        JsonNode rawTree = projectService.getRepositoryTree(userId, repoFullName, branch);

        // Extract base URL from request
        String baseUrl = extractBaseUrl(request);
        log.debug("Using base URL: {}", baseUrl);

        Object formattedTree = switch (format.toLowerCase()) {
            case "flat" -> treeFormatter.formatTreeAsList(rawTree, repoOwner, repoName, baseUrl);
            case "by-directory" -> treeFormatter.formatTreeByDirectory(rawTree, repoOwner, repoName, baseUrl);
            case "nested" -> treeFormatter.formatTreeAsNested(rawTree, repoOwner, repoName);
            default -> treeFormatter.formatTree(rawTree, repoOwner, repoName, baseUrl);
        };

        return ResponseEntity.ok(formattedTree);
    }

    /**
     * Fetch blob content from a GitHub repository using blob SHA.
     * Blobs are referenced from the repository tree response.
     *
     * @param userId   - User ID from header (X-USERID)
     * @param repoOwner - Repository owner
     * @param repoName - Repository name
     * @param sha      - SHA of the blob to fetch
     * @return FileContentResponse with the decoded blob content
     * <p>
     * Example: GET /api/projects/github/blob/owner/repo/485dee64bcfb48793379b200a1afd14e85a8aaf4
     */
    @GetMapping("/github/blob/{repoOwner}/{repoName}/{sha}")
    public ResponseEntity<FileContentResponse> getBlobContent(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName,
            @PathVariable String sha) {

        log.info("Fetching blob {} from repository {}/{} for user {}", sha, repoOwner, repoName, userId);

        String repoFullName = repoOwner + "/" + repoName;
        FileContentResponse blobContent = projectService.getBlobContent(userId, repoFullName, sha);

        return ResponseEntity.ok(blobContent);
    }

    /**
     * Extract base URL from HTTP request
     * Format: scheme://host:port (without context path)
     */
    private String extractBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();

        String baseUrl;
        if ((scheme.equals("http") && serverPort == 80) ||
            (scheme.equals("https") && serverPort == 443)) {
            baseUrl = String.format("%s://%s", scheme, serverName);
        } else {
            baseUrl = String.format("%s://%s:%d", scheme, serverName, serverPort);
        }

        return baseUrl;
    }

    /**
     * Check if user has capability to create projects.
     * User must have linked their GitHub username to create projects.
     *
     * @param userId - User ID from header (X-USERID)
     * @return Capability status with reason if not capable
     * <p>
     * Example: GET /api/projects/check-creation-capability
     * Response: {
     *   "canCreateProject": true,
     *   "hasGithubUsername": true,
     *   "message": "User is ready to create projects"
     * }
     */
    @GetMapping("/check-creation-capability")
    public ResponseEntity<Map<String, Object>> checkProjectCreationCapability(@RequestHeader("X-USERID") Long userId) {
        log.info("Checking project creation capability for user {}", userId);
        return ResponseEntity.ok(projectService.checkProjectCreationCapability(userId));
    }

    /**
     * Get commit diff/changes for a specific commit.
     *
     * @param userId - User ID from header (X-USERID)
     * @param projectId - Project ID
     * @param commitHash - Commit SHA/hash
     * @return JsonNode with commit details and file diffs
     * <p>
     * Example: GET /api/projects/1/commits/abc123def/diff
     * Response includes:
     * - commit metadata (author, date, message)
     * - files changed with additions/deletions
     * - patch/diff content for each file
     */
    @GetMapping("/{projectId}/commits/{commitHash}/diff")
    public ResponseEntity<JsonNode> getCommitDiff(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable Long projectId,
            @PathVariable String commitHash) {
        
        log.info("Fetching commit diff for project {} and commit {} by user {}", projectId, commitHash, userId);
        JsonNode commitDiff = projectService.getCommitDiff(userId, projectId, commitHash);
        return ResponseEntity.ok(commitDiff);
    }
}
