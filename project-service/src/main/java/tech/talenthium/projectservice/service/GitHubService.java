package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.MediaType;
import tech.talenthium.projectservice.dto.response.FileContentResponse;
import java.time.Instant;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class GitHubService {
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public String createInstallationToken(long installationId, String appJwt) throws Exception {
        String url = "https://api.github.com/app/installations/" + installationId + "/access_tokens";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(appJwt);
        headers.set("Accept", "application/vnd.github+json");
        HttpEntity<String> entity = new HttpEntity<>("{}", headers);
        ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.POST, entity, JsonNode.class);
        if (resp.getStatusCode().is2xxSuccessful()) {
            return resp.getBody().get("token").asText();
        }
        throw new RuntimeException("Unable to create installation token: " + resp.getStatusCode());
    }

    /**
     * Exchange a GitHub OAuth authorization code for an access token.
     *
     * @param clientId GitHub OAuth app client id
     * @param clientSecret GitHub OAuth app client secret
     * @param code Authorization code from GitHub
     * @param redirectUri Redirect URI registered in GitHub OAuth app
     * @return access token string or null on failure
     */
    public String exchangeOAuthCodeForAccessToken(String clientId, String clientSecret, String code, String redirectUri) {
        try {
            String url = "https://github.com/login/oauth/access_token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Accept", "application/json");

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("code", code);
            if (redirectUri != null && !redirectUri.isBlank()) {
                body.add("redirect_uri", redirectUri);
            }

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.POST, entity, JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null && resp.getBody().has("access_token")) {
                String token = resp.getBody().get("access_token").asText();
                log.info("Exchanged GitHub OAuth code for access token");
                return token;
            }

            log.error("GitHub OAuth token exchange failed: {}", resp.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("Error exchanging GitHub OAuth code: {}", e.getMessage(), e);
            return null;
        }
    }

    public JsonNode listInstallationRepos(String installationToken) {
        String url = "https://api.github.com/installation/repositories";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(installationToken);
        headers.set("Accept", "application/vnd.github+json");
        ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);
        return resp.getBody();
    }

    /**
     * Uninstall the GitHub App installation for a given installation id.
     * Requires an app JWT (not an installation token).
     */
    public void deleteInstallation(long installationId, String appJwt) {
        String url = "https://api.github.com/app/installations/" + installationId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(appJwt);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");

        ResponseEntity<Void> resp = rest.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Unable to delete installation: " + resp.getStatusCode());
        }
    }

    /**
     * Fetches file content from a GitHub repository using the GitHub API.
     *
     * @param repoFullName      - Repository full name (owner/repo)
     * @param filePath          - Path to the file in the repository
     * @param installationToken - GitHub installation access token
     * @return FileContentResponse with decoded file content
     */
    public FileContentResponse getFileContent(String repoFullName, String filePath, String installationToken) {
        try {
            String url = "https://api.github.com/repos/" + repoFullName + "/contents/" + filePath;
            log.info("Fetching file from GitHub: {} (repo: {})", filePath, repoFullName);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode body = resp.getBody();

                // Check if the response is a file (not a directory)
                if (body.has("type") && body.get("type").asText().equals("dir")) {
                    throw new RuntimeException("Path points to a directory, not a file");
                }

                // Decode the base64 content
                // GitHub returns base64 with newlines for formatting - we need to remove them
                String encodedContent = body.get("content").asText();
                String cleanedBase64 = encodedContent.replaceAll("\\s+", ""); // Remove all whitespace including newlines
                String decodedContent = new String(Base64.getDecoder().decode(cleanedBase64));

                log.info("Successfully fetched file: {} (size: {} bytes)", filePath, decodedContent.length());

                return FileContentResponse.builder()
                        .fileName(body.get("name").asText())
                        .path(body.get("path").asText())
                        .content(decodedContent)
                        .sha(body.get("sha").asText())
                        .htmlUrl(body.get("html_url").asText())
                        .build();
            }

            throw new RuntimeException("Failed to fetch file: " + resp.getStatusCode());
        } catch (Exception e) {
            log.error("Error fetching file content from GitHub: {} - {}", repoFullName + "/" + filePath, e.getMessage());

            // Add helpful error message for 404
            if (e.getMessage().contains("404")) {
                String helpMsg = String.format(
                        "File not found: %s in repository %s. " +
                                "Possible reasons: " +
                                "1) GitHub App doesn't have access to this repository, " +
                                "2) File path is incorrect (check case sensitivity), " +
                                "3) File is on a different branch. " +
                                "Please verify the GitHub App installation covers this repository.",
                        filePath, repoFullName
                );
                throw new RuntimeException(helpMsg, e);
            }

            throw new RuntimeException("Error fetching file content: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a repository is accessible by the installation token.
     * Useful for debugging access issues.
     *
     * @param repoFullName      - Repository full name (owner/repo)
     * @param installationToken - GitHub installation access token
     * @return true if accessible, false otherwise
     */
    public boolean canAccessRepository(String repoFullName, String installationToken) {
        try {
            String url = "https://api.github.com/repos/" + repoFullName;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            log.info("Repository access check for {}: {}", repoFullName, resp.getStatusCode());
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Cannot access repository {}: {}", repoFullName, e.getMessage());
            return false;
        }
    }

    /**
     * Gets the directory contents (file and folder list) at a specific path.
     *
     * @param repoFullName      - Repository full name (owner/repo)
     * @param path              - Directory path (empty string or null for root)
     * @param installationToken - GitHub installation access token
     * @return JsonNode array containing files and directories
     */
    public JsonNode getDirectoryContents(String repoFullName, String path, String installationToken) {
        try {
            // Build URL - if path is empty or null, get root directory
            String urlPath = (path == null || path.isEmpty() || path.equals("/")) ? "" : "/" + path;
            String url = "https://api.github.com/repos/" + repoFullName + "/contents" + urlPath;

            log.info("Fetching directory contents from: {} (path: {})", repoFullName, path == null || path.isEmpty() ? "root" : path);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode body = resp.getBody();

                // If response is an array, it's a directory listing
                if (body.isArray()) {
                    log.info("Successfully fetched {} items from directory", body.size());
                    return body;
                } else if (body.has("type") && body.get("type").asText().equals("file")) {
                    // Single file was requested
                    throw new RuntimeException("Path points to a file, not a directory. Use getFileContent() instead.");
                }

                return body;
            }

            throw new RuntimeException("Failed to fetch directory contents: " + resp.getStatusCode());
        } catch (Exception e) {
            log.error("Error fetching directory contents from {}/{}", repoFullName, path, e);
            throw new RuntimeException("Error fetching directory contents: " + e.getMessage(), e);
        }
    }

    /**
     * Gets the full repository tree recursively.
     * This returns all files and directories in the repository.
     *
     * @param repoFullName      - Repository full name (owner/repo)
     * @param branch            - Branch name (e.g., "main", "master") - if null, uses repository's default branch
     * @param installationToken - GitHub installation access token
     * @return JsonNode containing the recursive tree structure
     */
    public JsonNode getRepositoryTree(String repoFullName, String branch, String installationToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            // If branch is not specified, get the repository's default branch
            String branchToUse = branch;
            if (branchToUse == null || branchToUse.isEmpty()) {
                String repoUrl = "https://api.github.com/repos/" + repoFullName;
                ResponseEntity<JsonNode> repoResp = rest.exchange(repoUrl, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

                if (repoResp.getStatusCode().is2xxSuccessful() && repoResp.getBody() != null) {
                    branchToUse = repoResp.getBody().get("default_branch").asText();
                    log.info("Using repository's default branch: {}", branchToUse);
                } else {
                    throw new RuntimeException("Failed to fetch repository information");
                }
            }

            log.info("Fetching repository tree for: {} (branch: {})", repoFullName, branchToUse);

            // Get branch info to extract tree SHA
            String branchUrl = "https://api.github.com/repos/" + repoFullName + "/branches/" + branchToUse;
            ResponseEntity<JsonNode> branchResp = rest.exchange(branchUrl, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (!branchResp.getStatusCode().is2xxSuccessful() || branchResp.getBody() == null) {
                throw new RuntimeException("Failed to fetch branch information for branch: " + branchToUse);
            }

            String treeSha = branchResp.getBody().get("commit").get("commit").get("tree").get("sha").asText();

            // Now fetch the tree recursively
            String treeUrl = "https://api.github.com/repos/" + repoFullName + "/git/trees/" + treeSha + "?recursive=1";
            ResponseEntity<JsonNode> treeResp = rest.exchange(treeUrl, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (treeResp.getStatusCode().is2xxSuccessful() && treeResp.getBody() != null) {
                JsonNode tree = treeResp.getBody();
                log.info("Successfully fetched repository tree with {} items",
                        tree.has("tree") ? tree.get("tree").size() : 0);
                return tree;
            }

            throw new RuntimeException("Failed to fetch repository tree: " + treeResp.getStatusCode());
        } catch (Exception e) {
            log.error("Error fetching repository tree for {}", repoFullName, e);
            throw new RuntimeException("Error fetching repository tree: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches blob content from a GitHub repository using the blob SHA.
     * Blobs can be files or other objects referenced by their SHA from git tree.
     *
     * @param repoFullName      - Repository full name (owner/repo)
     * @param sha               - SHA of the blob to fetch
     * @param installationToken - GitHub installation access token
     * @return FileContentResponse with decoded blob content
     */
    public FileContentResponse getBlobContent(String repoFullName, String sha, String installationToken) {
        try {
            String url = "https://api.github.com/repos/" + repoFullName + "/git/blobs/" + sha;
            log.info("Fetching blob from GitHub: {} (repo: {})", sha, repoFullName);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode body = resp.getBody();

                // Get the content (base64 encoded)
                String encodedContent = body.get("content").asText();

                // Decode base64 content (remove whitespace first)
                String decodedContent = new String(
                        Base64.getDecoder().decode(encodedContent.replaceAll("\\s+", "")),
                        "UTF-8"
                );

                return FileContentResponse.builder()
                        .fileName(sha.substring(0, 8)) // Use first 8 chars of SHA as filename
                        .path(sha) // Use SHA as path
                        .content(decodedContent)
                        .sha(body.get("sha").asText())
                        .htmlUrl("https://github.com/" + repoFullName + "/git/blob/" + sha)
                        .build();
            }

            throw new RuntimeException("Failed to fetch blob: " + resp.getStatusCode());
        } catch (Exception e) {
            log.error("Error fetching blob content from GitHub: {} - {}", repoFullName + "/" + sha, e.getMessage());

            if (e.getMessage().contains("404")) {
                String helpMsg = String.format(
                        "Blob not found: %s in repository %s. " +
                                "This blob SHA may no longer exist or be invalid.",
                        sha, repoFullName
                );
                throw new RuntimeException(helpMsg, e);
            }

            throw new RuntimeException("Error fetching blob content: " + e.getMessage(), e);
        }
    }

    /**
     * Fetch commits from a GitHub repository.
     *
     * @param repoFullName      - Repository full name (owner/repo)
     * @param installationToken - GitHub installation access token
     * @param branch            - Branch name (optional, defaults to default branch)
     * @param perPage           - Number of commits per page (default: 30)
     * @return JsonNode containing commits array
     */
    public JsonNode getCommits(String repoFullName, String installationToken, String branch, int perPage) {
        try {
            String url = "https://api.github.com/repos/" + repoFullName + "/commits";
            log.info("Fetching commits from repository: {} (branch: {})", repoFullName, branch != null ? branch : "default");

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            StringBuilder urlBuilder = new StringBuilder(url).append("?per_page=").append(perPage);
            if (branch != null && !branch.isBlank()) {
                urlBuilder.append("&sha=").append(branch);
            }

            ResponseEntity<JsonNode> resp = rest.exchange(urlBuilder.toString(), HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                log.info("Successfully fetched commits from {} - Body: {}", repoFullName, resp.getBody());
                return resp.getBody();
            }

            log.error("Failed to fetch commits: {}", resp.getStatusCode());
            return mapper.createArrayNode();
        } catch (Exception e) {
            log.error("Error fetching commits from {}: {}", repoFullName, e.getMessage(), e);
            return mapper.createArrayNode();
        }
    }

    /**
     * Parse commit data from GitHub response.
     * Extracts relevant information from GitHub commit API response.
     *
     * @return Map of commit data
     */
    public static class CommitData {
        public String sha;
        public String message;
        public String author;
        public String authorEmail;
        public String authorLogin;
        public String avatarUrl;
        public Instant committedDate;

        public static CommitData from(JsonNode node) {
            CommitData data = new CommitData();
            try {
                data.sha = node.get("sha").asText();
                String[] messageParts = node.get("commit").get("message").asText().split("\n", 2);
                data.message = messageParts[0];
                data.author = node.get("commit").get("author").get("name").asText();
                data.authorEmail = node.get("commit").get("author").get("email").asText();
                String dateStr = node.get("commit").get("author").get("date").asText();
                data.committedDate = Instant.parse(dateStr);
                
                // Extract GitHub username and avatar from the top-level author object
                JsonNode authorNode = node.get("author");
                if (authorNode != null && !authorNode.isNull()) {
                    data.authorLogin = authorNode.get("login").asText();
                    JsonNode avatarNode = authorNode.get("avatar_url");
                    if (avatarNode != null && !avatarNode.isNull()) {
                        data.avatarUrl = avatarNode.asText();
                    }
                } else {
                    // Fallback to author display name if login not available
                    data.authorLogin = data.author;
                }
            } catch (Exception e) {
                log.error("Error parsing commit data: {}", e.getMessage());
            }
            return data;
        }
    }

    /**
     * Gets the authenticated user's GitHub information using an installation token.
     * Returns user details including login, name, email, avatar, etc.
     *
     * @param installationToken - GitHub installation access token
     * @return JsonNode containing user information
     */
    public JsonNode getAuthenticatedUser(String installationToken) {
        try {
            String url = "https://api.github.com/user";
            log.info("Fetching authenticated GitHub user information");

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode userInfo = resp.getBody();
                log.info("Successfully fetched user info for: {}", userInfo.get("login").asText());
                return userInfo;
            }

            log.error("Failed to fetch user info: {}", resp.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("Error fetching authenticated user: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Get commit details and diff for a specific commit.
     * 
     * @param repoFullName - Repository full name (owner/repo)
     * @param commitSha - Commit SHA/hash
     * @param installationToken - GitHub installation token
     * @return JsonNode containing commit details with files and diff (verification field removed)
     */
    public JsonNode getCommitDiff(String repoFullName, String commitSha, String installationToken) {
        String url = "https://api.github.com/repos/" + repoFullName + "/commits/" + commitSha;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(installationToken);
        headers.set("Accept", "application/vnd.github.v3+json");
        
        ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);
        
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode response = resp.getBody();
            
            // Remove verification field from commit object
            if (response.has("commit") && response.get("commit").has("verification")) {
                ((com.fasterxml.jackson.databind.node.ObjectNode) response.get("commit")).remove("verification");
            }
            
            log.info("Successfully fetched commit diff for {} in {}", commitSha, repoFullName);
            return response;
        }
        
        throw new RuntimeException("Failed to fetch commit diff: " + resp.getStatusCode());
    }

    /**
     * Get all branches from a GitHub repository.
     * 
     * @param repoFullName - Repository full name (owner/repo)
     * @param installationToken - GitHub installation token
     * @return JsonNode array containing all branches
     */
    public JsonNode getAllBranches(String repoFullName, String installationToken) {
        try {
            String url = "https://api.github.com/repos/" + repoFullName + "/branches";
            log.info("Fetching all branches from repository: {}", repoFullName);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(installationToken);
            headers.set("Accept", "application/vnd.github+json");

            ResponseEntity<JsonNode> resp = rest.exchange(url + "?per_page=100", HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode branches = resp.getBody();
                log.info("Successfully fetched {} branches from {}", branches.size(), repoFullName);
                return branches;
            }

            log.error("Failed to fetch branches: {}", resp.getStatusCode());
            return mapper.createArrayNode();
        } catch (Exception e) {
            log.error("Error fetching branches from {}: {}", repoFullName, e.getMessage(), e);
            return mapper.createArrayNode();
        }
    }
}
