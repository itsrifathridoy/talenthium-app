package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.projectservice.entity.Contribution;
import tech.talenthium.projectservice.entity.Contributor;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.repository.ContributionRepository;
import tech.talenthium.projectservice.repository.ContributorRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContributionService {
    private final ContributionRepository contributionRepository;
    private final ContributorRepository contributorRepository;
    private final GitHubService gitHubService;

    // Remove @Transactional from this method - each commit will be processed in its own transaction
    public void fetchAndStoreCommits(Project project, String installationToken, String defaultBranch) {
        log.info("Fetching commits for project: {} ({}) - Multi-branch mode", project.getName(), project.getGitLink());

        try {
            // Get all branches
            JsonNode branchesNode = gitHubService.getAllBranches(project.getGitLink(), installationToken);
            
            if (!branchesNode.isArray()) {
                log.warn("Expected array of branches, got: {}", branchesNode.getNodeType());
                return;
            }

            int totalSaved = 0;
            int totalSkipped = 0;

            // Process each branch
            for (JsonNode branchNode : branchesNode) {
                String branchName = branchNode.get("name").asText();
                log.info("Processing branch: {} for project: {}", branchName, project.getName());

                try {
                    JsonNode commitsNode = gitHubService.getCommits(project.getGitLink(), installationToken, branchName, 100);

                    if (commitsNode.isArray() && commitsNode.size() > 0) {
                        int saved = 0;
                        int skipped = 0;

                        for (JsonNode commitNode : commitsNode) {
                            GitHubService.CommitData commitData = GitHubService.CommitData.from(commitNode);

                            // Check if this specific commit+branch combination already exists
                            if (contributionRepository.existsByCommitShaAndBranch(commitData.sha, branchName)) {
                                skipped++;
                                continue;
                            }

                            // Process each commit in its own transaction
                            try {
                                saveCommitInNewTransaction(project, branchName, commitData);
                                saved++;
                                log.debug("Saved commit: {} on branch '{}' by {}", commitData.sha.substring(0, 7), branchName, commitData.author);
                            } catch (Exception e) {
                                log.warn("Error processing commit {} on branch '{}': {}", commitData.sha.substring(0, 7), branchName, e.getMessage());
                            }
                        }

                        totalSaved += saved;
                        totalSkipped += skipped;
                        log.info("Branch '{}' complete - Saved: {}, Skipped: {}", branchName, saved, skipped);
                    } else {
                        log.debug("No commits found on branch: {}", branchName);
                    }
                } catch (Exception e) {
                    log.error("Error fetching commits for branch '{}': {}", branchName, e.getMessage(), e);
                }
            }

            log.info("Multi-branch commit import complete for {} - Total Saved: {}, Total Skipped: {}", project.getName(), totalSaved, totalSkipped);
        } catch (Exception e) {
            log.error("Error processing branches for project {}: {}", project.getName(), e.getMessage(), e);
        }
    }

    /**
     * Save a single commit in its own transaction to prevent rollback cascading.
     * Uses REQUIRES_NEW propagation to ensure each commit is independent.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveCommitInNewTransaction(Project project, String branchName, GitHubService.CommitData commitData) {
        // Find or create contributor
        String authorName = commitData.author;
        String githubUsername = commitData.authorLogin;
        
        Contributor contributor = contributorRepository.findByProjectAndGithubUsername(project, githubUsername)
                .orElseGet(() -> {
                    Contributor newContributor = Contributor.builder()
                            .project(project)
                            .name(authorName)
                            .githubUsername(githubUsername)
                            .avatarUrl(commitData.avatarUrl)
                            .email(commitData.authorEmail)
                            .role("Contributor")
                            .build();
                    return contributorRepository.save(newContributor);
                });

        // Create contribution with branch information
        Contribution contribution = Contribution.builder()
                .project(project)
                .contributor(contributor)
                .commitSha(commitData.sha)
                .commitMessage(commitData.message)
                .type("Commit")
                .committedDate(commitData.committedDate)
                .branch(branchName)
                .build();

        contributionRepository.save(contribution);
    }

    public List<Contribution> getProjectContributions(Project project) {
        return contributionRepository.findByProjectOrderByCommittedDateDesc(project);
    }

    public int getContributionCount(Project project) {
        return (int) contributionRepository.findByProjectOrderByCommittedDateDesc(project).stream()
                .count();
    }
}
