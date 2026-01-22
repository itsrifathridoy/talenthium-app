package tech.talenthium.projectservice.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.dto.response.RepositoryResponse;
import tech.talenthium.projectservice.helper.JwtUtil;
import tech.talenthium.projectservice.service.GitHubService;
import tech.talenthium.projectservice.service.GithubInstallService;
import tech.talenthium.projectservice.service.UserService;
import tech.talenthium.projectservice.service.GitHubAppAuthService;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/github")
public class InstallController {
    @Value("${github.app-id}") long appId;
    @Value("${github.app-slug}") String appSlug;
    @Value("${github.private-key-pem}") String privateKeyPath;
    private final GitHubService ghService;
    private final GithubInstallService githubInstallService;
    private final UserService userService;
    private final GitHubAppAuthService gitHubAppAuthService;

    // OAuth app credentials (safe defaults to avoid startup failure if unset)
    @Value("${github.oauth.client-id:}") String oauthClientId;
    @Value("${github.oauth.client-secret:}") String oauthClientSecret;
    @Value("${github.oauth.redirect-uri:}") String oauthRedirectUri;
    @Value("${frontend.oauth-success-redirect:http://localhost:3000/projects?github=connected}") String oauthSuccessRedirect;
    @Value("${frontend.oauth-error-redirect:http://localhost:3000/projects?github=oauth_error}") String oauthErrorRedirect;

    @GetMapping("/callback")
    public RedirectView postInstallCallback(@RequestParam Map<String,String> params) throws Exception {
        String installationIdStr = params.get("installation_id");
        String userId = params.get("state"); // ← comes back from GitHub
        
        try {
            if (installationIdStr == null || userId == null) {
                log.error("GitHub callback missing installation_id or userId");
                return new RedirectView("/projects/create?error=missing_params");
            }

            long installationId = Long.parseLong(installationIdStr);

            Path pemPath = resolvePrivateKey(privateKeyPath);

            // Generate JWT + token
            String appJwt = JwtUtil.generateAppJwt(appId, pemPath);
            String installationToken = new GitHubService().createInstallationToken(installationId, appJwt);

            JsonNode response = new GitHubService().listInstallationRepos(installationToken);
            JsonNode repos = response.get("repositories");

            // Save mapping userId ↔ installationId
            githubInstallService.saveGithubInstallation(installationIdStr, Long.parseLong(userId), repos);
            
            log.info("GitHub App successfully installed for user {} with installation ID {}", userId, installationId);

            // Redirect back to the create project page with success
            return new RedirectView("http://localhost:3000/projects/create?github=connected");
        } catch (Exception e) {
            log.error("Error processing GitHub callback: {}", e.getMessage(), e);
            return new RedirectView("/projects/create?error=callback_failed");
        }
    }


    private Path resolvePrivateKey(String configured) throws Exception {
        if (configured == null || configured.isBlank()) {
            throw new IllegalArgumentException("github.private-key-pem is not configured");
        }
        String value = configured.trim();

        // classpath resource
        if (value.startsWith("classpath:")) {
            String cp = value.substring("classpath:".length());
            ClassPathResource res = new ClassPathResource(cp);
            if (!res.exists()) {
                throw new IllegalArgumentException("Private key not found on classpath at: " + cp);
            }
            Path tmp = Files.createTempFile("github-app-key", ".pem");
            try (InputStream in = res.getInputStream()) {
                Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
            }
            return tmp;
        }

        // Inline PEM content support (optional but handy)
        if (value.startsWith("-----BEGIN")) {
            Path tmp = Files.createTempFile("github-app-key", ".pem");
            Files.writeString(tmp, value, StandardCharsets.UTF_8);
            return tmp;
        }

        // Treat as filesystem path (absolute or relative)
        Path p = Paths.get(value).toAbsolutePath().normalize();
        if (!Files.exists(p)) {
            throw new IllegalArgumentException("Private key file not found at: " + p);
        }
        return p;
    }

    /**
     * Begin GitHub OAuth flow to retrieve user's GitHub username.
     * Returns an authorization URL including a state token tied to the caller's userId.
     */
    @GetMapping("/oauth/authorization-url")
    public ResponseEntity<?> getGithubOAuthAuthorizationUrl(@RequestHeader("X-USERID") Long userId) {
        if (oauthClientId == null || oauthClientId.isBlank() || oauthRedirectUri == null || oauthRedirectUri.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "GitHub OAuth is not configured (missing client-id or redirect-uri)."
            ));
        }

        String state = JwtUtil.generateInstallationToken(userId);
        // Encode scope to avoid invalid characters in query param
        String encodedScope = UriUtils.encodeQueryParam("read:user user:email", StandardCharsets.UTF_8);
        String url = UriComponentsBuilder
            .fromHttpUrl("https://github.com/login/oauth/authorize")
            .queryParam("client_id", oauthClientId)
            .queryParam("redirect_uri", oauthRedirectUri)
            .queryParam("scope", encodedScope)
            .queryParam("state", state)
            .build(false)
            .toUriString();

        return ResponseEntity.ok(Map.of(
                "authorizationUrl", url,
                "message", "Visit this URL to authorize GitHub and link username"
        ));
    }

    /**
     * OAuth callback endpoint. Exchanges code for an access token, fetches /user to get login/id,
     * updates the local user record, then redirects to frontend with a status query.
     */
    @GetMapping("/oauth/callback")
    public RedirectView githubOAuthCallback(@RequestParam("code") String code,
                                            @RequestParam("state") String state) {
        try {
            DecodedJWT decoded = JwtUtil.verifyInstallationToken(state);
            Long userId = Long.parseLong(decoded.getIssuer());

            if (oauthClientId == null || oauthClientId.isBlank() || oauthClientSecret == null || oauthClientSecret.isBlank()) {
                log.error("GitHub OAuth not configured: missing client credentials");
                return new RedirectView(oauthErrorRedirect + "&reason=not_configured");
            }

            String accessToken = ghService.exchangeOAuthCodeForAccessToken(oauthClientId, oauthClientSecret, code, oauthRedirectUri);
            if (accessToken == null || accessToken.isBlank()) {
                log.error("GitHub OAuth token exchange failed");
                return new RedirectView(oauthErrorRedirect + "&reason=token_exchange_failed");
            }

            JsonNode userInfo = ghService.getAuthenticatedUser(accessToken);
            if (userInfo == null || !userInfo.has("login")) {
                log.error("GitHub OAuth user fetch failed");
                return new RedirectView(oauthErrorRedirect + "&reason=user_fetch_failed");
            }

            String githubUsername = userInfo.get("login").asText();
            String githubId = userInfo.has("id") ? String.valueOf(userInfo.get("id").asLong()) : null;
            userService.updateGithubInfo(userId, githubUsername, githubId);
            log.info("Linked GitHub via OAuth: {} -> user {}", githubUsername, userId);

            return new RedirectView(oauthSuccessRedirect);
        } catch (Exception e) {
            log.error("Error in GitHub OAuth callback: {}", e.getMessage(), e);
            return new RedirectView(oauthErrorRedirect + "&reason=exception");
        }
    }

    @GetMapping("/installation-token")
    public ResponseEntity<?> getInstallationToken(@RequestHeader("X-USERID") Long userId) {
        String token = JwtUtil.generateInstallationToken(userId);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/install")
    public RedirectView getInstallUrl(@RequestParam("token") String token) {
        DecodedJWT decoded = JwtUtil.verifyInstallationToken(token);
        String url = "https://github.com/apps/" + appSlug + "/installations/new?state=" + decoded.getIssuer();
        return new RedirectView(url);
    }

    /**
     * Get the GitHub App installation URL for the user to authorize.
     * Returns the URL that the user should visit to install the GitHub App.
     *
     * @param userId - User ID from header (X-USERID)
     * @return Map with the authorization URL
     * <p>
     * Example: GET /github/authorization-url
     */
    @GetMapping("/authorization-url")
    public ResponseEntity<?> getAuthorizationUrl(@RequestHeader("X-USERID") Long userId) {
        // Generate a token that identifies the user making the request
        String installationToken = JwtUtil.generateInstallationToken(userId);
        String authUrl = "https://github.com/apps/" + appSlug + "/installations/new?state=" + userId;
        
        return ResponseEntity.ok(Map.of(
                "authorizationUrl", authUrl,
                "message", "Visit this URL to authorize the GitHub App"
        ));
    }

    @GetMapping("/get-repos")
    public ResponseEntity<?> getAppUrl(@RequestHeader("X-USERID") Long userId) throws Exception {
        GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

        return ResponseEntity.ok(installation.getRepositories());
    }

    /**
     * Fetch fresh list of accessible repositories from GitHub.
     * This generates a new installation token and fetches the latest repo list.
     *
     * @param userId - User ID from header (X-USERID)
     * @return Map with installation status and repositories
     * <p>
     * Example: GET /github/repos
     */
    @GetMapping("/repos")
    public ResponseEntity<?> getAccessibleRepositories(@RequestHeader("X-USERID") Long userId) throws Exception {
        log.info("Fetching accessible repositories for user {}", userId);
        
        try {
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);
            
            if (installation == null || installation.getInstallationId() == null) {
                return ResponseEntity.ok(Map.of(
                        "isInstalled", false,
                        "message", "GitHub App is not installed. Please authorize first.",
                        "repositories", new ArrayList<>()
                ));
            }

            // Get installation token and fetch fresh repo list
            Path pemPath = resolvePrivateKey(privateKeyPath);
            String appJwt = JwtUtil.generateAppJwt(appId, pemPath);
            String installationToken = new GitHubService().createInstallationToken(
                    Long.parseLong(installation.getInstallationId()), 
                    appJwt
            );
            
            JsonNode reposResponse = new GitHubService().listInstallationRepos(installationToken);
            JsonNode repos = reposResponse.get("repositories");
            
            List<RepositoryResponse> repositoryResponses = new ArrayList<>();
            if (repos != null && repos.isArray()) {
                for (JsonNode repo : repos) {
                    RepositoryResponse repoResponse = RepositoryResponse.builder()
                            .id(repo.get("id").asLong())
                            .name(repo.get("name").asText())
                            .fullName(repo.get("full_name").asText())
                            .description(repo.get("description").asText(null))
                            .isPrivate(repo.get("private").asBoolean())
                            .language(repo.get("language").asText(null))
                            .starsCount(repo.get("stargazers_count").asInt(0))
                            .forksCount(repo.get("forks_count").asInt(0))
                            .defaultBranch(repo.get("default_branch").asText("main"))
                            .htmlUrl(repo.get("html_url").asText())
                            .owner(RepositoryResponse.OwnerInfo.builder()
                                    .id(repo.get("owner").get("id").asLong())
                                    .login(repo.get("owner").get("login").asText())
                                    .avatarUrl(repo.get("owner").get("avatar_url").asText())
                                    .type(repo.get("owner").get("type").asText())
                                    .build())
                            .build();
                    repositoryResponses.add(repoResponse);
                }
            }
            
            return ResponseEntity.ok(Map.of(
                    "isInstalled", true,
                    "repositories", repositoryResponses,
                    "count", repositoryResponses.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching repositories for user {}: {}", userId, e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "isInstalled", false,
                    "message", "Error fetching repositories: " + e.getMessage(),
                    "repositories", new ArrayList<>()
            ));
        }
    }

    /**
     * Uninstall GitHub App for the current user.
     * Calls GitHub API to delete the installation and removes local record.
     */
    @DeleteMapping("/installation")
    public ResponseEntity<?> uninstall(@RequestHeader("X-USERID") Long userId) throws Exception {
        try {
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);
            if (installation == null || installation.getInstallationId() == null) {
                return ResponseEntity.ok(Map.of(
                        "isInstalled", false,
                        "message", "No GitHub installation found for this user"
                ));
            }

            Path pemPath = resolvePrivateKey(privateKeyPath);
            String appJwt = JwtUtil.generateAppJwt(appId, pemPath);
            ghService.deleteInstallation(Long.parseLong(installation.getInstallationId()), appJwt);

            githubInstallService.deleteGithubInstallation(userId);

            return ResponseEntity.ok(Map.of(
                    "isInstalled", false,
                    "message", "GitHub App uninstalled successfully"
            ));
        } catch (Exception ex) {
            log.error("Failed to uninstall GitHub App for user {}: {}", userId, ex.getMessage());
            throw ex;
        }
    }

    /**
     * Link GitHub account to the current user.
     * Fetches GitHub user info and updates the user's githubUsername in the database.
     * 
     * @param userId - User ID from header (X-USERID)
     * @return Updated user information with GitHub username
     */
    @PostMapping("/link-account")
    public ResponseEntity<?> linkGithubAccount(@RequestHeader("X-USERID") Long userId) {
        try {
            log.info("Linking GitHub account for user {}", userId);

            // Check if user has GitHub installation
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);
            if (installation == null || installation.getInstallationId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "No GitHub installation found. Please install the GitHub App first."
                ));
            }

            // Generate installation token
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = ghService.createInstallationToken(installationId, appJwt);

            // Get GitHub user info
            JsonNode userInfo = ghService.getAuthenticatedUser(installationToken);
            
            if (userInfo == null || !userInfo.has("login")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to fetch GitHub user information"
                ));
            }

            String githubUsername = userInfo.get("login").asText();
            String githubId = userInfo.has("id") ? String.valueOf(userInfo.get("id").asLong()) : null;

            // Update user with GitHub info
            userService.updateGithubInfo(userId, githubUsername, githubId);

            log.info("Successfully linked GitHub account {} for user {}", githubUsername, userId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "GitHub account linked successfully",
                    "githubUsername", githubUsername,
                    "githubId", githubId != null ? githubId : ""
            ));

        } catch (Exception e) {
            log.error("Error linking GitHub account for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to link GitHub account: " + e.getMessage()
            ));
        }
    }


}
