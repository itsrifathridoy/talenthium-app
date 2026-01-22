package tech.talenthium.projectservice.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tech.talenthium.projectservice.config.RabbitMQConfig;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.event.CommitFetchEvent;
import tech.talenthium.projectservice.repository.ProjectRepository;
import tech.talenthium.projectservice.service.ContributionService;
import tech.talenthium.projectservice.service.GitHubAppAuthService;
import tech.talenthium.projectservice.service.GitHubService;
import tech.talenthium.projectservice.service.GithubInstallService;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommitFetchListener {

    private final ProjectRepository projectRepository;
    private final GithubInstallService githubInstallService;
    private final GitHubAppAuthService gitHubAppAuthService;
    private final GitHubService gitHubService;
    private final ContributionService contributionService;

    @RabbitListener(queues = RabbitMQConfig.COMMIT_FETCH_QUEUE)
    public void handleCommitFetch(CommitFetchEvent event) {
        log.info("=".repeat(80));
        log.info("Processing commit fetch event for project: {} (ID: {})", event.getProjectName(), event.getProjectId());
        log.info("=".repeat(80));

        try {
            // Fetch the project
            Project project = projectRepository.findById(event.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found: " + event.getProjectId()));

            // Get GitHub installation token
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(event.getUserId());
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            // Fetch commits from all branches
            String defaultBranch = event.getDefaultBranch() != null ? event.getDefaultBranch() : "master";
            log.info("Fetching commits for project '{}' starting from branch '{}'", project.getName(), defaultBranch);
            
            contributionService.fetchAndStoreCommits(project, installationToken, defaultBranch);

            log.info("=".repeat(80));
            log.info("Successfully completed commit fetch for project: {}", event.getProjectName());
            log.info("=".repeat(80));
        } catch (Exception e) {
            log.error("=".repeat(80));
            log.error("Error processing commit fetch event for project {}: {}", event.getProjectName(), e.getMessage(), e);
            log.error("=".repeat(80));
        }
    }
}
