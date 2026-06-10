package tech.talenthium.projectservice.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tech.talenthium.projectservice.config.RabbitMQConfig;
import tech.talenthium.projectservice.entity.Contribution;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.event.CommitFetchEvent;
import tech.talenthium.projectservice.repository.ProjectRepository;
import tech.talenthium.projectservice.service.CommitAnalysisService;
import tech.talenthium.projectservice.service.ContributionService;
import tech.talenthium.projectservice.service.GitHubAppAuthService;
import tech.talenthium.projectservice.service.GitHubService;
import tech.talenthium.projectservice.service.GithubInstallService;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommitFetchListener {

    private final ProjectRepository projectRepository;
    private final GithubInstallService githubInstallService;
    private final GitHubAppAuthService gitHubAppAuthService;
    private final GitHubService gitHubService;
    private final ContributionService contributionService;
    private final CommitAnalysisService commitAnalysisService;

    @RabbitListener(queues = RabbitMQConfig.COMMIT_FETCH_QUEUE)
    public void handleCommitFetch(CommitFetchEvent event) {
        log.info("=".repeat(80));
        log.info("Processing commit fetch event for project: {} (ID: {})", event.getProjectName(), event.getProjectId());
        log.info("=".repeat(80));

        try {
            Project project = projectRepository.findById(event.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found: " + event.getProjectId()));

            GithubAppInstallation installation = githubInstallService.getGithubInstallation(event.getUserId());
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            String defaultBranch = event.getDefaultBranch() != null ? event.getDefaultBranch() : "master";
            log.info("Fetching commits for project '{}' starting from branch '{}'", project.getName(), defaultBranch);

            contributionService.fetchAndStoreCommits(project, installationToken, defaultBranch);

            log.info("=".repeat(80));
            log.info("Successfully completed commit fetch for project: {}", event.getProjectName());
            log.info("=".repeat(80));

            // Trigger async AI analysis for all saved contributions
            String repoFullName = extractRepoFullName(project.getGitLink());
            List<Contribution> contributions = contributionService.getProjectContributions(project);
            int analysisCount = 0;
            for (Contribution c : contributions) {
                if (c.getAiSummary() == null) {
                    commitAnalysisService.analyzeAndStoreAsync(c.getId(), event.getUserId(), repoFullName, c.getCommitSha());
                    analysisCount++;
                }
            }
            log.info("Queued {} AI analysis tasks for project: {}", analysisCount, event.getProjectName());

            // Trigger async tech stack detection
            commitAnalysisService.generateAndStoreTechStackAsync(event.getProjectId(), event.getUserId(), repoFullName);
            log.info("[TechStack] Queued tech stack generation for project: {}", event.getProjectName());

        } catch (Exception e) {
            log.error("=".repeat(80));
            log.error("Error processing commit fetch event for project {}: {}", event.getProjectName(), e.getMessage(), e);
            log.error("=".repeat(80));
        }
    }

    private String extractRepoFullName(String gitLink) {
        String url = gitLink.replace(".git", "");
        String[] parts = url.split("/");
        if (parts.length >= 2) {
            return parts[parts.length - 2] + "/" + parts[parts.length - 1];
        }
        throw new RuntimeException("Invalid GitHub URL: " + gitLink);
    }
}
