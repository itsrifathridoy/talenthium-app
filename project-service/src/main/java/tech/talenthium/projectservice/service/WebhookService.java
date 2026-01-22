package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.projectservice.entity.Contribution;
import tech.talenthium.projectservice.entity.Contributor;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.repository.ContributionRepository;
import tech.talenthium.projectservice.repository.ContributorRepository;
import tech.talenthium.projectservice.repository.GithubInstallRepo;
import tech.talenthium.projectservice.repository.ProjectRepository;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebhookService {
    private final GithubInstallRepo githubInstallRepo;
    private final ProjectRepository projectRepository;
    private final ContributionRepository contributionRepository;
    private final ContributorRepository contributorRepository;

    /**
     * Handle installation deleted webhook event
     * Deletes the installation from database
     */
    @Transactional
    public void handleInstallationDeleted(JsonNode payload) {
        try {
            String installationId = payload.path("installation").path("id").asText();
            log.info("Processing installation deletion - Installation ID: {}", installationId);

            githubInstallRepo.findByInstallationId(installationId).ifPresentOrElse(
                installation -> {
                    githubInstallRepo.delete(installation);
                    log.info("Successfully deleted installation from database - Installation ID: {}", installationId);
                },
                () -> log.warn("Installation not found in database - Installation ID: {}", installationId)
            );
        } catch (Exception e) {
            log.error("Error handling installation deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle installation created webhook event
     * Saves the new installation to database
     */
    @Transactional
    public void handleInstallationCreated(JsonNode payload) {
        try {
            JsonNode installation = payload.path("installation");
            String installationId = installation.path("id").asText();
            long ownerId = installation.path("account").path("id").asLong();
            JsonNode repositories = payload.path("repositories");

            log.info("Processing installation creation - Installation ID: {}, Owner ID: {}, Repos: {}",
                    installationId, ownerId, repositories.size());

            // The GithubInstallService already handles this
            log.info("Installation created webhook received - Installation ID: {}", installationId);
        } catch (Exception e) {
            log.error("Error handling installation creation: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle installation_repositories webhook event (repos added/removed)
     */
    @Transactional
    public void handleInstallationRepositories(JsonNode payload) {
        try {
            String action = payload.path("action").asText();
            String installationId = payload.path("installation").path("id").asText();

            log.info("Processing installation_repositories event - Action: {}, Installation ID: {}",
                    action, installationId);

            if ("added".equals(action)) {
                JsonNode addedRepos = payload.path("repositories_added");
                log.info("Repositories added to installation {}: {} repos", installationId, addedRepos.size());
                for (JsonNode repo : addedRepos) {
                    log.info("  - Added repo: {}", repo.path("full_name").asText());
                }
            } else if ("removed".equals(action)) {
                JsonNode removedRepos = payload.path("repositories_removed");
                log.info("Repositories removed from installation {}: {} repos", installationId, removedRepos.size());
                for (JsonNode repo : removedRepos) {
                    log.info("  - Removed repo: {}", repo.path("full_name").asText());
                }
            }
        } catch (Exception e) {
            log.error("Error handling installation_repositories event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle push webhook event
     * Updates contributions and contributors for the affected project
     */
    @Transactional
    public void handlePush(JsonNode payload) {
        try {
            String repoFullName = payload.path("repository").path("full_name").asText();
            JsonNode commitsNode = payload.path("commits");
            boolean isDeleted = payload.path("deleted").asBoolean();

            log.info("Processing push event - Repository: {}, Commits: {}, Deleted: {}",
                    repoFullName, commitsNode.size(), isDeleted);

            if (isDeleted) {
                log.info("Branch was deleted, skipping commit processing");
                return;
            }

            // Find projects that match this repository
            List<Project> matchingProjects = projectRepository.findAll().stream()
                    .filter(p -> {
                        String gitLink = p.getGitLink();
                        // Match against "owner/repo" format or full GitHub URL
                        return gitLink != null && (
                                gitLink.equals(repoFullName) ||
                                gitLink.contains(repoFullName)
                        );
                    })
                    .toList();

            if (matchingProjects.isEmpty()) {
                log.info("No projects found for repository: {}", repoFullName);
                return;
            }

            log.info("Found {} project(s) for repository: {}", matchingProjects.size(), repoFullName);

            // Process commits for each matching project
            for (Project project : matchingProjects) {
                processCommitsForProject(project, commitsNode);
            }

        } catch (Exception e) {
            log.error("Error handling push event: {}", e.getMessage(), e);
        }
    }

    /**
     * Process commits from webhook payload and create/update contributions and contributors
     */
    private void processCommitsForProject(Project project, JsonNode commits) {
        int saved = 0;
        int skipped = 0;

        log.info("Processing {} commits for project: {}", commits.size(), project.getName());

        for (JsonNode commit : commits) {
            try {
                String commitId = commit.path("id").asText();
                String message = commit.path("message").asText();
                String timestamp = commit.path("timestamp").asText();

                // Check if commit already exists
                if (contributionRepository.existsByCommitSha(commitId)) {
                    skipped++;
                    log.debug("Skipping existing commit: {}", commitId.substring(0, 7));
                    continue;
                }

                // Extract author information
                JsonNode authorNode = commit.path("author");
                String authorName = authorNode.path("name").asText();
                String authorEmail = authorNode.path("email").asText();
                String authorUsername = authorNode.path("username").asText();

                // If username is missing, try to extract from committer
                if (authorUsername == null || authorUsername.isEmpty()) {
                    authorUsername = commit.path("committer").path("username").asText();
                }

                // Find or create contributor
                Contributor contributor = findOrCreateContributor(
                        project,
                        authorName,
                        authorUsername,
                        authorEmail
                );

                // Parse timestamp
                Instant committedDate;
                try {
                    committedDate = ZonedDateTime.parse(timestamp).toInstant();
                } catch (Exception e) {
                    committedDate = Instant.now();
                    log.warn("Failed to parse timestamp {}, using current time", timestamp);
                }

                // Create contribution
                Contribution contribution = Contribution.builder()
                        .project(project)
                        .contributor(contributor)
                        .commitSha(commitId)
                        .commitMessage(message)
                        .type("Commit")
                        .committedDate(committedDate)
                        .build();

                contributionRepository.save(contribution);
                saved++;

                log.debug("Saved commit: {} by {}", commitId.substring(0, 7), authorName);

            } catch (Exception e) {
                log.warn("Error processing commit: {}", e.getMessage());
            }
        }

        log.info("Completed processing commits for project {} - Saved: {}, Skipped: {}",
                project.getName(), saved, skipped);
    }

    /**
     * Find existing contributor or create new one
     */
    private Contributor findOrCreateContributor(Project project, String name, String githubUsername, String email) {
        // Try to find by GitHub username first (most reliable)
        if (githubUsername != null && !githubUsername.isEmpty()) {
            Optional<Contributor> existing = contributorRepository.findByProjectAndGithubUsername(project, githubUsername);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        // Create new contributor
        Contributor newContributor = Contributor.builder()
                .project(project)
                .name(name)
                .githubUsername(githubUsername)
                .email(email)
                .role("Contributor")
                .build();

        return contributorRepository.save(newContributor);
    }
}
