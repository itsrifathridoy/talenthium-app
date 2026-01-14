package tech.talenthium.projectservice.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.helper.JwtUtil;
import tech.talenthium.projectservice.service.GitHubService;
import tech.talenthium.projectservice.service.GithubInstallService;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
@RequiredArgsConstructor
@RestController
@RequestMapping("/github")
public class InstallController {
    @Value("${github.app-id}") long appId;
    @Value("${github.app-slug}") String appSlug;
    @Value("${github.private-key-pem}") String privateKeyPath;
    private final GitHubService ghService;
    private final GithubInstallService githubInstallService;

    @GetMapping("/callback")
    public ResponseEntity<?> postInstallCallback(@RequestParam Map<String,String> params) throws Exception {
        String installationIdStr = params.get("installation_id");
        String userId = params.get("state"); // ← comes back from GitHub
        if (installationIdStr == null || userId == null) {
            return ResponseEntity.badRequest().body("Missing installation_id or userId");
        }

        long installationId = Long.parseLong(installationIdStr);

        Path pemPath = resolvePrivateKey(privateKeyPath);

        // Generate JWT + token
        String appJwt = JwtUtil.generateAppJwt(appId, pemPath);
        String installationToken = new GitHubService().createInstallationToken(installationId, appJwt);

        JsonNode response = new GitHubService().listInstallationRepos(installationToken);

        JsonNode repos = response.get("repositories");

        // Save mapping userId ↔ installationId
        githubInstallService.saveGithubInstallation(installationIdStr, Long.parseLong(userId),repos);

        return ResponseEntity.ok(repos);
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

    @GetMapping("/get-repos")
    public ResponseEntity<?> getAppUrl(@RequestHeader("X-USERID") Long userId) throws Exception {
        GithubAppInstallation installation = githubInstallService.getGithubInstallation(userId);

        return ResponseEntity.ok(installation.getRepositories());
    }


}
