package tech.talenthium.projectservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tech.talenthium.projectservice.dto.request.DeployRequest;
import tech.talenthium.projectservice.entity.Deployment;
import tech.talenthium.projectservice.service.DeploymentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;

    @GetMapping("/{projectId}/environment")
    public ResponseEntity<Map<String, Object>> getEnvironment(@PathVariable Long projectId) {
        return ResponseEntity.ok(deploymentService.getEnvironment(projectId));
    }

    @PostMapping("/{projectId}/environment")
    public ResponseEntity<Void> saveEnvironment(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        String env = (String) body.get("env");
        String buildArgs = (String) body.get("buildArgs");
        String buildSecrets = (String) body.get("buildSecrets");
        Boolean createEnvFile = body.get("createEnvFile") instanceof Boolean
                ? (Boolean) body.get("createEnvFile") : Boolean.TRUE;
        deploymentService.saveEnvironment(projectId, env, buildArgs, buildSecrets, createEnvFile);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{projectId}/deploy")
    public ResponseEntity<Deployment> deploy(
            @PathVariable Long projectId,
            @RequestHeader("X-USERID") Long userId,
            @RequestBody(required = false) DeployRequest request) {
        DeployRequest req = request != null ? request : new DeployRequest();
        Deployment deployment = deploymentService.triggerDeploy(projectId, userId, req);
        return ResponseEntity.ok(deployment);
    }

    @GetMapping("/{projectId}/deployments")
    public ResponseEntity<List<Map<String, Object>>> getDeployments(@PathVariable Long projectId) {
        return ResponseEntity.ok(deploymentService.getDeployments(projectId));
    }

    @GetMapping(value = "/{projectId}/deployments/{deploymentId}/logs", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs(@PathVariable Long projectId, @PathVariable String deploymentId) {
        SseEmitter emitter = new SseEmitter(10 * 60 * 1000L);
        deploymentService.streamDeploymentLogs(projectId, deploymentId, emitter);
        return emitter;
    }

    @PostMapping("/{projectId}/deployments/{deploymentId}/sync")
    public ResponseEntity<Deployment> syncDeployment(
            @PathVariable Long projectId,
            @PathVariable Long deploymentId) {
        return ResponseEntity.ok(deploymentService.syncStatus(projectId, deploymentId));
    }

    @PostMapping("/{projectId}/deploy/provision")
    public ResponseEntity<Map<String, String>> provision(
            @PathVariable Long projectId,
            @RequestHeader("X-USERID") Long userId) {
        return ResponseEntity.ok(deploymentService.provision(projectId, userId));
    }

    @GetMapping("/{projectId}/domains")
    public ResponseEntity<List<Map<String, Object>>> getDomains(@PathVariable Long projectId) {
        return ResponseEntity.ok(deploymentService.getDomains(projectId));
    }

    @PostMapping("/{projectId}/domains/generate")
    public ResponseEntity<String> generateDomain(@PathVariable Long projectId) {
        return ResponseEntity.ok(deploymentService.generateDomainHost(projectId));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/{projectId}/domains")
    public ResponseEntity<Map<String, Object>> createDomain(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body) {
        String host = (String) body.get("host");
        boolean https = Boolean.TRUE.equals(body.get("https"));
        String certificateType = body.get("certificateType") instanceof String
                ? (String) body.get("certificateType") : "none";
        Integer port = body.get("port") instanceof Number
                ? ((Number) body.get("port")).intValue() : null;
        String path = (String) body.get("path");
        return ResponseEntity.ok(deploymentService.createDomain(projectId, host, https, certificateType, port, path));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/{projectId}/deploy/configure-git")
    public ResponseEntity<Map<String, String>> configureGit(
            @PathVariable Long projectId,
            @RequestHeader("X-USERID") Long userId,
            @RequestBody(required = false) Map<String, Object> body) {
        String branch            = body != null ? (String) body.get("branch") : null;
        String buildPath         = body != null ? (String) body.get("buildPath") : null;
        List<String> watchPaths  = body != null ? (List<String>) body.get("watchPaths") : null;
        Boolean enableSubmodules = body != null && body.get("enableSubmodules") instanceof Boolean
                ? (Boolean) body.get("enableSubmodules") : null;
        boolean reuseExistingKey = body != null && Boolean.TRUE.equals(body.get("reuseExistingKey"));
        String publicKey = deploymentService.configureGit(projectId, userId, branch, buildPath, watchPaths, enableSubmodules, reuseExistingKey);
        return ResponseEntity.ok(Map.of("publicKey", publicKey));
    }
}
