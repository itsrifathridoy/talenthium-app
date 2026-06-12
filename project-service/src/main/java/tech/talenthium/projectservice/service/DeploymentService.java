package tech.talenthium.projectservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.projectservice.dto.request.DeployRequest;
import tech.talenthium.projectservice.entity.Deployment;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.repository.DeploymentRepository;
import tech.talenthium.projectservice.repository.ProjectRepository;
import tech.talenthium.projectservice.type.DeploymentStatus;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ProjectRepository projectRepository;
    private final DokployService dokployService;
    private final GitHubService gitHubService;
    private final GithubInstallService githubInstallService;
    private final GitHubAppAuthService gitHubAppAuthService;

    @Transactional
    public Deployment triggerDeploy(Long projectId, Long userId, DeployRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (!dokployService.isConfigured()) {
            throw new RuntimeException("Deployment is not configured. Set cloud.api-key and cloud.environment-id.");
        }

        String branch = req.getBranch() != null && !req.getBranch().isBlank()
                ? req.getBranch()
                : (project.getDefaultBranch() != null ? project.getDefaultBranch() : "main");

        // Ensure the project has a Dokploy application (create once, reuse forever)
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) {
            applicationId = provisionDokployApp(project);
            project.setDokployApplicationId(applicationId);
            projectRepository.save(project);
        }

        // Build a human-readable title
        String title = req.getTitle() != null && !req.getTitle().isBlank()
                ? req.getTitle()
                : "Deploy " + branch + (req.getCommitHash() != null ? " @ " + req.getCommitHash().substring(0, Math.min(7, req.getCommitHash().length())) : "");

        // Persist deployment record before calling Dokploy (so we always have a record)
        Deployment deployment = Deployment.builder()
                .project(project)
                .status(DeploymentStatus.STARTED)
                .branch(branch)
                .commitHash(req.getCommitHash())
                .title(title)
                .dokployApplicationId(applicationId)
                .startedAt(LocalDateTime.now())
                .build();
        deployment = deploymentRepository.save(deployment);

        // Trigger deployment on Dokploy
        try {
            dokployService.deploy(applicationId);

            // Fetch most recent Dokploy deployment ID to track it
            List<Map<String, Object>> dokDeployments = dokployService.getDeployments(applicationId);
            if (!dokDeployments.isEmpty()) {
                String dokDeployId = (String) dokDeployments.get(0).get("deploymentId");
                deployment.setDokployDeploymentId(dokDeployId);
                deployment.setStatus(DeploymentStatus.BUILDING);
            }
        } catch (Exception e) {
            log.error("Dokploy deploy failed for project {}: {}", projectId, e.getMessage());
            deployment.setStatus(DeploymentStatus.FAILED);
            deployment.setLog("Trigger failed: " + e.getMessage());
        }

        return deploymentRepository.save(deployment);
    }

    @Transactional
    public Deployment syncStatus(Long projectId, Long deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Deployment not found: " + deploymentId));

        if (!deployment.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Deployment does not belong to project " + projectId);
        }

        String applicationId = deployment.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) {
            return deployment; // nothing to sync
        }

        try {
            List<Map<String, Object>> dokDeployments = dokployService.getDeployments(applicationId);
            Map<String, Object> match = dokDeployments.stream()
                    .filter(d -> deployment.getDokployDeploymentId() != null
                            && deployment.getDokployDeploymentId().equals(d.get("deploymentId")))
                    .findFirst()
                    .orElse(dokDeployments.isEmpty() ? null : dokDeployments.get(0));

            if (match != null) {
                String rawStatus = String.valueOf(match.get("status"));
                DeploymentStatus mapped = mapDokployStatus(rawStatus);
                deployment.setStatus(mapped);
                if (match.get("deploymentId") != null) {
                    deployment.setDokployDeploymentId((String) match.get("deploymentId"));
                }
                if (mapped == DeploymentStatus.SUCCESSFUL || mapped == DeploymentStatus.FAILED
                        || mapped == DeploymentStatus.CANCELLED) {
                    deployment.setCompletedAt(LocalDateTime.now());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync deployment {} status: {}", deploymentId, e.getMessage());
        }

        return deploymentRepository.save(deployment);
    }

    public List<Map<String, Object>> getDeployments(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) return List.of();
        return dokployService.getDeployments(applicationId);
    }

    public void streamDeploymentLogs(Long projectId, String deploymentId, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                Project project = projectRepository.findById(projectId).orElse(null);
                if (project == null || project.getDokployApplicationId() == null) {
                    emitter.complete();
                    return;
                }
                String logPath = dokployService.getLogPath(project.getDokployApplicationId(), deploymentId);
                if (logPath == null || logPath.isBlank()) {
                    emitter.send(SseEmitter.event().data("Log path not found for deployment " + deploymentId));
                    emitter.complete();
                    return;
                }
                dokployService.streamLogs(logPath,
                        line -> { try { emitter.send(SseEmitter.event().data(line)); } catch (Exception ignored) {} },
                        emitter::complete,
                        err -> { try { emitter.send(SseEmitter.event().data("[error] " + err.getMessage())); emitter.complete(); } catch (Exception ignored) {} }
                );
            } catch (Exception e) {
                try { emitter.send(SseEmitter.event().data("[error] " + e.getMessage())); emitter.complete(); } catch (Exception ignored) {}
            }
        });
    }

    @Transactional
    public Map<String, String> provision(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (!dokployService.isConfigured()) {
            throw new RuntimeException("Deployment is not configured. Set cloud.api-key and cloud.environment-id.");
        }

        boolean firstProvision = (project.getDokployApplicationId() == null || project.getDokployApplicationId().isBlank());

        String applicationId = project.getDokployApplicationId();
        if (firstProvision) {
            applicationId = provisionDokployApp(project);
            project.setDokployApplicationId(applicationId);
            log.info("Provisioned Dokploy project+app for project {}", projectId);
        } else {
            log.info("Project {} already provisioned: {}", projectId, applicationId);
        }

        // Fetch and persist the refreshToken (webhook key)
        String refreshToken = dokployService.getRefreshToken(applicationId);
        if (refreshToken != null) {
            project.setDokployRefreshToken(refreshToken);
        }
        projectRepository.save(project);

        String webhookUrl = refreshToken != null ? dokployService.buildWebhookUrl(refreshToken) : null;

        // Register GitHub webhook on first provision (best-effort)
        if (firstProvision && webhookUrl != null) {
            try {
                String[] ownerRepo = parseGitLink(project.getGitLink());
                GithubAppInstallation inst = githubInstallService.getGithubInstallation(userId);
                String appJwt = gitHubAppAuthService.generateAppJWT();
                String token = gitHubService.createInstallationToken(Long.parseLong(inst.getInstallationId()), appJwt);
                gitHubService.createWebhook(ownerRepo[0], ownerRepo[1], webhookUrl, token);
            } catch (Exception e) {
                log.warn("Could not register GitHub webhook for project {}: {}", projectId, e.getMessage());
            }
        }

        Map<String, String> result = new java.util.LinkedHashMap<>();
        result.put("applicationId", applicationId);
        if (webhookUrl != null) result.put("webhookUrl", webhookUrl);
        return result;
    }

    @Transactional
    public String configureGit(Long projectId, Long userId, String branch,
                               String buildPath, List<String> watchPaths, Boolean enableSubmodules,
                               boolean reuseExistingKey) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        if (!dokployService.isConfigured()) {
            throw new RuntimeException("Deployment is not configured. Set cloud.api-key and cloud.environment-id.");
        }

        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) {
            throw new RuntimeException("Application not provisioned yet. Click 'Create App' first.");
        }

        String branchToUse = branch != null && !branch.isBlank() ? branch
                : (project.getDefaultBranch() != null ? project.getDefaultBranch() : "main");

        String sshKeyId;
        String publicKeyValue;

        boolean hasStoredKey = project.getDokploySshKeyId() != null && !project.getDokploySshKeyId().isBlank();

        if (reuseExistingKey && hasStoredKey) {
            // Reuse the already-registered SSH key — skip generation
            sshKeyId = project.getDokploySshKeyId();
            publicKeyValue = project.getDokployPublicKey();
            log.info("Reusing existing SSH key {} for project {}", sshKeyId, projectId);
        } else {
            // Generate a fresh key pair and register it on Dokploy
            Map<String, String> keys = dokployService.generateSshKey();
            sshKeyId = dokployService.createSshKey("deploy-" + project.getId(), keys.get("privateKey"), keys.get("publicKey"));
            publicKeyValue = keys.get("publicKey");

            // Persist (never store private key)
            project.setDokploySshKeyId(sshKeyId);
            project.setDokployPublicKey(publicKeyValue);

            // Register the public key as a deploy key on GitHub (best-effort)
            try {
                String[] ownerRepo = parseGitLink(project.getGitLink());
                GithubAppInstallation inst = githubInstallService.getGithubInstallation(userId);
                String appJwt = gitHubAppAuthService.generateAppJWT();
                String token = gitHubService.createInstallationToken(Long.parseLong(inst.getInstallationId()), appJwt);
                gitHubService.createDeployKey(ownerRepo[0], ownerRepo[1], publicKeyValue, token);
            } catch (Exception e) {
                log.warn("Could not register deploy key on GitHub for project {}: {}", projectId, e.getMessage());
            }
        }

        // Configure git provider on Dokploy
        String gitUrl = toSshGitUrl(project.getGitLink());
        String resolvedBuildPath = buildPath != null && !buildPath.isBlank() ? buildPath : "/";
        List<String> resolvedWatchPaths = watchPaths != null ? watchPaths : List.of();
        boolean resolvedSubmodules = Boolean.TRUE.equals(enableSubmodules);
        dokployService.saveGitProvider(applicationId, gitUrl, branchToUse, sshKeyId,
                resolvedBuildPath, resolvedWatchPaths, resolvedSubmodules);

        projectRepository.save(project);
        log.info("Git configured for project {} → {} branch={} reuseKey={}", projectId, gitUrl, branchToUse, reuseExistingKey);

        return publicKeyValue;
    }

    public Map<String, Object> getEnvironment(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank())
            return Map.of("env", "", "buildArgs", "", "buildSecrets", "", "createEnvFile", true);
        return dokployService.getApplicationEnv(applicationId);
    }

    public void saveEnvironment(Long projectId, String env, String buildArgs,
                                String buildSecrets, Boolean createEnvFile) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank())
            throw new RuntimeException("Application not provisioned yet.");
        dokployService.saveEnvironment(applicationId, env, buildArgs, buildSecrets,
                Boolean.TRUE.equals(createEnvFile));
    }

    public List<Map<String, Object>> getDomains(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) return List.of();
        return dokployService.getDomains(applicationId);
    }

    public String generateDomainHost(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) {
            throw new RuntimeException("Application not provisioned yet.");
        }
        return dokployService.generateDomainHost(applicationId);
    }

    public Map<String, Object> createDomain(Long projectId, String host, boolean https,
                                             String certificateType, Integer port, String path) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        String applicationId = project.getDokployApplicationId();
        if (applicationId == null || applicationId.isBlank()) {
            throw new RuntimeException("Application not provisioned yet.");
        }
        return dokployService.createDomain(applicationId, host, https, certificateType, port, path);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String provisionDokployApp(Project project) throws RuntimeException {
        String appName = project.getName() + "-" + project.getId();
        log.info("Provisioning Dokploy project+app for project {}", project.getId());

        // Step 1: create a Dokploy project (organisational container)
        String dokployProjectId = dokployService.createProject(appName, project.getShortDescription());
        if (dokployProjectId != null) {
            project.setDokployProjectId(dokployProjectId);
        }

        // Step 2: create the application inside the configured environment
        String applicationId = dokployService.createApplication(appName);

        log.info("Dokploy app {} provisioned for project {}", applicationId, project.getId());
        return applicationId;
    }

    private String[] parseGitLink(String gitLink) {
        // Full URL: https://github.com/owner/repo or git@github.com:owner/repo
        Matcher m = Pattern.compile("github\\.com[/:]([^/]+)/([^/\\.\\s]+)").matcher(gitLink);
        if (m.find()) return new String[]{m.group(1), m.group(2)};
        // Short form: owner/repo
        Matcher s = Pattern.compile("^([^/\\s]+)/([^/\\.\\s]+)$").matcher(gitLink.trim());
        if (s.matches()) return new String[]{s.group(1), s.group(2)};
        throw new RuntimeException("Cannot parse GitHub URL: " + gitLink);
    }

    private String toSshGitUrl(String gitLink) {
        if (gitLink == null) throw new RuntimeException("Project has no git link");
        if (gitLink.startsWith("git@")) return gitLink;
        String[] ownerRepo = parseGitLink(gitLink);
        return "git@github.com:" + ownerRepo[0] + "/" + ownerRepo[1] + ".git";
    }

    private DeploymentStatus mapDokployStatus(String status) {
        return switch (status.toLowerCase()) {
            case "done", "success" -> DeploymentStatus.SUCCESSFUL;
            case "error", "failed" -> DeploymentStatus.FAILED;
            case "cancelled", "canceled" -> DeploymentStatus.CANCELLED;
            case "building", "running" -> DeploymentStatus.BUILDING;
            default -> DeploymentStatus.BUILDING;
        };
    }
}
