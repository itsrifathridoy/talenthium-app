package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletionStage;
import java.util.function.Consumer;

@Service
@Slf4j
public class DokployService {

    @Value("${cloud.base-url:https://cloud.furnituredots.com/api}")
    private String baseUrl;

    @Value("${cloud.api-key:}")
    private String apiToken;

    @Value("${cloud.environment-id:}")
    private String environmentId;

    @Value("${cloud.github-provider-id:}")
    private String githubProviderId;

    private final RestTemplate rest = new RestTemplate(new HttpComponentsClientHttpRequestFactory());

    private HttpHeaders headers() {
        HttpHeaders h = new HttpHeaders();
        h.set("x-api-key", apiToken);
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    /** Creates a new Dokploy project and returns its projectId. */
    public String createProject(String name, String description) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        if (description != null && !description.isBlank()) body.put("description", description);

        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/project.create", HttpMethod.POST, new HttpEntity<>(body, headers()), JsonNode.class);

        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            return resp.getBody().path("projectId").asText(null);
        }
        throw new RuntimeException("Failed to create Dokploy project");
    }

    /** Creates a Dokploy application inside an environment, returns applicationId. */
    public String createApplication(String name) {
        if (environmentId == null || environmentId.isBlank()) {
            throw new RuntimeException("cloud.environment-id is not configured");
        }
        String appName = name.toLowerCase().replaceAll("[^a-z0-9._-]", "-");
        if (appName.length() > 63) appName = appName.substring(0, 63);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("appName", appName);
        body.put("environmentId", environmentId);

        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/application.create", HttpMethod.POST, new HttpEntity<>(body, headers()), JsonNode.class);

        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            return resp.getBody().path("applicationId").asText(null);
        }
        throw new RuntimeException("Failed to create Dokploy application");
    }

    /** Links a Dokploy application to a GitHub repository. */
    public void saveGithubProvider(String applicationId, String owner, String repo, String branch) {
        if (githubProviderId == null || githubProviderId.isBlank()) {
            throw new RuntimeException("cloud.github-provider-id is not configured");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("applicationId", applicationId);
        body.put("owner", owner);
        body.put("repository", repo);
        body.put("branch", branch != null && !branch.isBlank() ? branch : "main");
        body.put("buildPath", "/");
        body.put("githubId", githubProviderId);
        body.put("triggerType", "push");
        body.put("enableSubmodules", false);

        rest.exchange(baseUrl + "/application.saveGithubProvider", HttpMethod.POST,
                new HttpEntity<>(body, headers()), JsonNode.class);

        log.info("Saved GitHub provider for application {} → {}/{}", applicationId, owner, repo);
    }

    /** Triggers a deployment for the given applicationId via tRPC. */
    public void deploy(String applicationId) {
        Map<String, Object> input = new LinkedHashMap<>();
        input.put("applicationId", applicationId);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("0", Map.of("json", input));

        rest.exchange(baseUrl + "/trpc/application.deploy?batch=1", HttpMethod.POST,
                new HttpEntity<>(body, headers()), JsonNode.class);

        log.info("Triggered deploy for application {}", applicationId);
    }

    /** Returns the live deployment list for an application via allByType. */
    public List<Map<String, Object>> getDeployments(String applicationId) {
        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/deployment.allByType?id=" + applicationId + "&type=application",
                HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);

        List<Map<String, Object>> result = new ArrayList<>();
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode data = resp.getBody();
            if (data.isArray()) {
                for (JsonNode d : data) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("deploymentId", d.path("deploymentId").asText(null));
                    m.put("title", d.path("title").asText(null));
                    m.put("description", d.path("description").asText(null));
                    m.put("status", d.path("status").asText("running"));
                    m.put("logPath", d.path("logPath").asText(null));
                    m.put("startedAt", d.path("startedAt").asText(null));
                    m.put("finishedAt", d.path("finishedAt").asText(null));
                    m.put("errorMessage", d.path("errorMessage").asText(null));
                    result.add(m);
                }
            }
        }
        return result;
    }

    /** Finds the logPath for a specific deploymentId. */
    public String getLogPath(String applicationId, String deploymentId) {
        return getDeployments(applicationId).stream()
                .filter(d -> deploymentId.equals(d.get("deploymentId")))
                .map(d -> (String) d.get("logPath"))
                .findFirst().orElse(null);
    }

    /** Streams log lines from Dokploy's WebSocket for a given logPath. */
    public void streamLogs(String logPath, Consumer<String> onLine, Runnable onComplete, Consumer<Throwable> onError) {
        String wssUrl = baseUrl
                .replaceFirst("^https://", "wss://")
                .replaceFirst("^http://", "ws://")
                .replaceAll("/api$", "")
                + "/listen-deployment?logPath=" + logPath;

        log.info("Opening log stream: {}", wssUrl);
        HttpClient.newBuilder().build()
                .newWebSocketBuilder()
                .header("x-api-key", apiToken)
                .buildAsync(URI.create(wssUrl), new WebSocket.Listener() {
                    @Override
                    public CompletionStage<?> onText(WebSocket ws, CharSequence data, boolean last) {
                        onLine.accept(data.toString());
                        ws.request(1);
                        return null;
                    }
                    @Override
                    public CompletionStage<?> onClose(WebSocket ws, int statusCode, String reason) {
                        onComplete.run();
                        return null;
                    }
                    @Override
                    public void onError(WebSocket ws, Throwable error) {
                        log.warn("Log stream error for {}: {}", logPath, error.getMessage());
                        onError.accept(error);
                    }
                });
    }

    /** Asks Dokploy to generate an SSH key pair. Returns {"publicKey", "privateKey"}. */
    public Map<String, String> generateSshKey() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("0", Map.of("json", new LinkedHashMap<>()));

        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/trpc/sshKey.generate?batch=1",
                HttpMethod.POST, new HttpEntity<>(body, headers()), JsonNode.class);

        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode data = trpcExtract(resp.getBody());
            Map<String, String> keys = new LinkedHashMap<>();
            keys.put("publicKey", data.path("publicKey").asText(""));
            keys.put("privateKey", data.path("privateKey").asText(""));
            return keys;
        }
        throw new RuntimeException("Failed to generate SSH key via Dokploy");
    }

    /** Registers a key pair in Dokploy's SSH key store and returns its sshKeyId. */
    public String createSshKey(String baseKeyName, String privateKey, String publicKey) {
        // Unique name so we can look it up after creation (Dokploy create returns null body)
        String uniqueName = baseKeyName + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);

        Map<String, Object> input = new LinkedHashMap<>();
        input.put("name", uniqueName);
        input.put("description", "Auto-generated deploy key");
        input.put("privateKey", privateKey);
        input.put("publicKey", publicKey);
        input.put("organizationId", "");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("0", Map.of("json", input));

        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/trpc/sshKey.create?batch=1",
                HttpMethod.POST, new HttpEntity<>(body, headers()), JsonNode.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to create SSH key on Dokploy: " + resp.getStatusCode());
        }

        // Dokploy returns json:null on success — find the key by unique name
        return findSshKeyIdByName(uniqueName);
    }

    /** Lists all SSH keys and returns the sshKeyId matching the given name. */
    private String findSshKeyIdByName(String name) {
        // input={"0":{"json":null,"meta":{"values":["undefined"],"v":1}}}  (URL-encoded)
        String url = baseUrl + "/trpc/sshKey.all?batch=1"
                + "&input=%7B%220%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%2C%22v%22%3A1%7D%7D%7D";

        ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);

        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode keys = trpcExtract(resp.getBody());
            if (keys.isArray()) {
                for (JsonNode key : keys) {
                    if (name.equals(key.path("name").asText(null))) {
                        String id = key.path("sshKeyId").asText(null);
                        if (id != null && !id.isEmpty()) return id;
                    }
                }
            }
        }
        throw new RuntimeException("SSH key was created but could not be found by name: " + name);
    }

    /** Fetches the organizationId for the authenticated Dokploy user. */
    private volatile String cachedOrgId;

    private String fetchOrganizationId() {
        if (cachedOrgId != null) return cachedOrgId;
        try {
            ResponseEntity<JsonNode> resp = rest.exchange(
                    baseUrl + "/trpc/auth.get?batch=1",
                    HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                String orgId = trpcExtract(resp.getBody()).path("organizationId").asText(null);
                if (orgId != null && !orgId.isEmpty()) {
                    cachedOrgId = orgId;
                    return cachedOrgId;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch organizationId from Dokploy: {}", e.getMessage());
        }
        throw new RuntimeException("Could not retrieve organizationId from Dokploy. Check your API key.");
    }

    /** Extracts data from a tRPC batch response: [{result:{data:{json:{...}}}}] */
    private JsonNode trpcExtract(JsonNode resp) {
        if (resp.isArray() && !resp.isEmpty()) {
            JsonNode json = resp.get(0).path("result").path("data").path("json");
            if (!json.isMissingNode()) return json;
            return resp.get(0).path("result").path("data");
        }
        return resp;
    }

    /** Configures a custom Git (SSH) provider for an application. */
    public void saveGitProvider(String applicationId, String gitUrl, String branch, String sshKeyId,
                                String buildPath, List<String> watchPaths, boolean enableSubmodules) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("applicationId", applicationId);
        body.put("customGitUrl", gitUrl);
        body.put("customGitBranch", branch != null && !branch.isBlank() ? branch : "main");
        body.put("customGitBuildPath", buildPath != null && !buildPath.isBlank() ? buildPath : "/");
        body.put("customGitSSHKeyId", sshKeyId);
        body.put("enableSubmodules", enableSubmodules);
        body.put("watchPaths", watchPaths != null ? watchPaths : List.of());

        rest.exchange(baseUrl + "/application.saveGitProvider", HttpMethod.POST,
                new HttpEntity<>(body, headers()), JsonNode.class);

        log.info("Saved Git provider for application {} → {}", applicationId, gitUrl);
    }

    /** Fetches a single application and returns its refreshToken (webhook key). */
    public String getRefreshToken(String applicationId) {
        try {
            ResponseEntity<JsonNode> resp = rest.exchange(
                    baseUrl + "/application.one?applicationId=" + applicationId,
                    HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return resp.getBody().path("refreshToken").asText(null);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch refreshToken for application {}: {}", applicationId, e.getMessage());
        }
        return null;
    }

    /** Returns the webhook URL for a given refreshToken. */
    public String buildWebhookUrl(String refreshToken) {
        // Strip /api suffix to get the root, then append the webhook path
        String root = baseUrl.endsWith("/api") ? baseUrl.substring(0, baseUrl.length() - 4) : baseUrl;
        return root + "/api/deploy/" + refreshToken;
    }

    public boolean isConfigured() {
        return apiToken != null && !apiToken.isBlank()
                && environmentId != null && !environmentId.isBlank();
    }

    /** Lists all domains attached to an application. */
    public List<Map<String, Object>> getDomains(String applicationId) {
        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/domain.byApplicationId?applicationId=" + applicationId,
                HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);

        List<Map<String, Object>> result = new ArrayList<>();
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode data = resp.getBody();
            if (data.isArray()) {
                for (JsonNode d : data) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("domainId", d.path("domainId").asText(null));
                    m.put("host", d.path("host").asText(null));
                    m.put("https", d.path("https").asBoolean(false));
                    m.put("port", d.path("port").isNull() ? null : d.path("port").asInt());
                    m.put("path", d.path("path").asText("/"));
                    m.put("internalPath", d.path("internalPath").asText("/"));
                    m.put("certificateType", d.path("certificateType").asText("none"));
                    m.put("domainType", d.path("domainType").asText(null));
                    m.put("createdAt", d.path("createdAt").asText(null));
                    result.add(m);
                }
            }
        }
        return result;
    }

    /** Auto-generates a unique hostname for the application via Dokploy. */
    public String generateDomainHost(String applicationId) {
        String appName = getAppName(applicationId);
        if (appName == null || appName.isBlank()) {
            throw new RuntimeException("Could not determine appName for application " + applicationId);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("appName", appName);
        body.put("serverId", "");

        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/domain.generateDomain",
                HttpMethod.POST, new HttpEntity<>(body, headers()), JsonNode.class);

        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode node = resp.getBody();
            return node.isTextual() ? node.asText() : node.path("host").asText(null);
        }
        throw new RuntimeException("Failed to generate domain host");
    }

    /** Creates a domain entry for an application on Dokploy. */
    public Map<String, Object> createDomain(String applicationId, String host, boolean https,
                                             String certificateType, Integer port, String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("domainId", "");
        body.put("applicationId", applicationId);
        body.put("host", host);
        body.put("path", path);
        body.put("internalPath", null);
        body.put("stripPath", false);
        body.put("port", port);
        body.put("useCustomEntrypoint", false);
        body.put("customEntrypoint", null);
        body.put("https", https);
        body.put("certificateType", certificateType != null ? certificateType : "none");
        body.put("customCertResolver", null);
        body.put("domainType", "application");
        body.put("middlewares", List.of());

        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/domain.create",
                HttpMethod.POST, new HttpEntity<>(body, headers()), JsonNode.class);

        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode d = resp.getBody();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("domainId", d.path("domainId").asText(null));
            result.put("host", d.path("host").asText(null));
            result.put("https", d.path("https").asBoolean(false));
            result.put("port", d.path("port").isNull() ? null : d.path("port").asInt());
            result.put("path", d.path("path").asText(null));
            result.put("certificateType", d.path("certificateType").asText("none"));
            return result;
        }
        throw new RuntimeException("Failed to create domain on Dokploy");
    }

    /** Returns env, buildArgs, buildSecrets, createEnvFile for an application. */
    public Map<String, Object> getApplicationEnv(String applicationId) {
        ResponseEntity<JsonNode> resp = rest.exchange(
                baseUrl + "/application.one?applicationId=" + applicationId,
                HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);
        if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
            JsonNode n = resp.getBody();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("env", n.path("env").isNull() ? "" : n.path("env").asText(""));
            result.put("buildArgs", n.path("buildArgs").isNull() ? "" : n.path("buildArgs").asText(""));
            result.put("buildSecrets", n.path("buildSecrets").isNull() ? "" : n.path("buildSecrets").asText(""));
            result.put("createEnvFile", n.path("createEnvFile").asBoolean(true));
            return result;
        }
        throw new RuntimeException("Failed to fetch application env for " + applicationId);
    }

    /** Persists environment variables for an application. */
    public void saveEnvironment(String applicationId, String env, String buildArgs,
                                String buildSecrets, boolean createEnvFile) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("applicationId", applicationId);
        body.put("env", env != null ? env : "");
        body.put("buildArgs", buildArgs != null ? buildArgs : "");
        body.put("buildSecrets", buildSecrets != null ? buildSecrets : "");
        body.put("createEnvFile", createEnvFile);
        rest.exchange(baseUrl + "/application.saveEnvironment", HttpMethod.POST,
                new HttpEntity<>(body, headers()), JsonNode.class);
        log.info("Saved environment for application {}", applicationId);
    }

    private String getAppName(String applicationId) {
        try {
            ResponseEntity<JsonNode> resp = rest.exchange(
                    baseUrl + "/application.one?applicationId=" + applicationId,
                    HttpMethod.GET, new HttpEntity<>(headers()), JsonNode.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return resp.getBody().path("appName").asText(null);
            }
        } catch (Exception e) {
            log.warn("Could not fetch appName for {}: {}", applicationId, e.getMessage());
        }
        return null;
    }
}
