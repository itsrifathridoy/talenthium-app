package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tech.talenthium.projectservice.dto.response.CommitSummaryResponse;
import tech.talenthium.projectservice.entity.Contribution;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.entity.ProjectTechStack;
import tech.talenthium.projectservice.entity.User;
import tech.talenthium.projectservice.repository.ContributionRepository;
import tech.talenthium.projectservice.repository.ProjectRepository;
import tech.talenthium.projectservice.repository.ProjectTechStackRepository;
import tech.talenthium.projectservice.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommitAnalysisService {

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";
    private static final int MAX_DIFF_CHARS = 8000;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ContributionRepository contributionRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTechStackRepository projectTechStackRepository;
    private final GitHubService gitHubService;
    private final GithubInstallService githubInstallService;
    private final GitHubAppAuthService gitHubAppAuthService;
    private final UserRepository userRepository;

    /** Resolves an installation token using the repo owner's GitHub App installation,
     *  falling back to the requesting user's if the owner isn't a Talenthium user. */
    private String resolveInstallationToken(String repoOwnerGithubUsername, Long fallbackUserId) throws Exception {
        if (repoOwnerGithubUsername != null && !repoOwnerGithubUsername.isBlank()) {
            Optional<User> ownerOpt = userRepository.findByGithubUsername(repoOwnerGithubUsername);
            if (ownerOpt.isPresent()) {
                try {
                    GithubAppInstallation inst = githubInstallService.getGithubInstallation(ownerOpt.get().getUserId());
                    String appJwt = gitHubAppAuthService.generateAppJWT();
                    return gitHubService.createInstallationToken(Long.parseLong(inst.getInstallationId()), appJwt);
                } catch (Exception e) {
                    log.warn("Repo owner '{}' has no GitHub App installation, falling back to {}: {}",
                            repoOwnerGithubUsername, fallbackUserId, e.getMessage());
                }
            }
        }
        GithubAppInstallation inst = githubInstallService.getGithubInstallation(fallbackUserId);
        String appJwt = gitHubAppAuthService.generateAppJWT();
        return gitHubService.createInstallationToken(Long.parseLong(inst.getInstallationId()), appJwt);
    }

    /**
     * On-demand analysis: returns cached DB summary if present, otherwise fetches diff,
     * calls Groq, persists result, and returns it.
     */
    @Transactional
    public CommitSummaryResponse analyzeCommit(Long userId, Long projectId, String commitHash) throws Exception {
        // Return cached result if already analysed
        Optional<Contribution> existing = contributionRepository.findByCommitSha(commitHash);
        if (existing.isPresent() && existing.get().getAiSummary() != null) {
            log.info("Returning cached AI summary for commit {}", commitHash);
            return toResponse(existing.get());
        }

        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new RuntimeException("Groq API key not configured (groq.api-key)");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        String repoFullName = extractRepoFullName(project.getGitLink());
        String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);
        JsonNode commitData = gitHubService.getCommitDiff(repoFullName, commitHash, installationToken);

        CommitSummaryResponse summary = buildAndCallGroq(commitHash, commitData);

        // Persist into Contribution row
        existing.ifPresent(c -> persistSummary(c, summary));

        return summary;
    }

    /**
     * Called from WebhookService after a push commit is saved.
     * Runs in a separate thread; waits briefly for the webhook transaction to commit.
     */
    @Async
    @Transactional
    public void analyzeAndStoreAsync(Long contributionId, Long ownerId, String repoFullName, String commitSha) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("Groq API key not set — skipping async analysis for commit {}", commitSha);
            return;
        }

        // Wait for the webhook transaction to commit before reading the contribution
        Contribution contribution = null;
        for (int attempt = 1; attempt <= 5; attempt++) {
            Optional<Contribution> found = contributionRepository.findById(contributionId);
            if (found.isPresent()) {
                contribution = found.get();
                break;
            }
            try { Thread.sleep(400L * attempt); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); return; }
        }

        if (contribution == null) {
            log.warn("Contribution {} not found after retries — skipping analysis", contributionId);
            return;
        }

        if (contribution.getAiSummary() != null) {
            log.debug("Commit {} already has AI summary — skipping", commitSha);
            return;
        }

        log.info("[AI] Starting analysis for commit {} (contribution {})", commitSha, contributionId);

        try {
            GithubAppInstallation installation = githubInstallService.getGithubInstallation(ownerId);
            long installationId = Long.parseLong(installation.getInstallationId());
            String appJwt = gitHubAppAuthService.generateAppJWT();
            String installationToken = gitHubService.createInstallationToken(installationId, appJwt);

            JsonNode commitData = gitHubService.getCommitDiff(repoFullName, commitSha, installationToken);
            log.info("[AI] Fetched diff for commit {} — calling Groq ({})", commitSha, GROQ_MODEL);
            CommitSummaryResponse summary = buildAndCallGroq(commitSha, commitData);
            log.info("[AI] Groq response received for commit {} — summary: '{}', type: {}, impact: {}", commitSha, summary.getSummary(), summary.getType(), summary.getImpact());
            persistSummary(contribution, summary);
            log.info("[AI] Summary persisted for commit {} (project: {})", commitSha, repoFullName);

            log.info("Async AI summary stored for commit {} (project repo: {})", commitSha, repoFullName);
        } catch (Exception e) {
            log.error("Async AI analysis failed for commit {}: {}", commitSha, e.getMessage());
        }
    }

    // ─── private helpers ──────────────────────────────────────────────────────

    private void persistSummary(Contribution contribution, CommitSummaryResponse summary) {
        contribution.setAiSummary(summary.getSummary());
        contribution.setAiChanges(summary.getChanges());
        contribution.setAiImpact(summary.getImpact());
        contribution.setAiType(summary.getType());
        contribution.setAiFilesChanged(summary.getFilesChanged());
        contribution.setAiAdditions(summary.getTotalAdditions());
        contribution.setAiDeletions(summary.getTotalDeletions());
        contributionRepository.save(contribution);
    }

    private CommitSummaryResponse toResponse(Contribution c) {
        return CommitSummaryResponse.builder()
                .commitHash(c.getCommitSha())
                .summary(c.getAiSummary())
                .changes(c.getAiChanges() != null ? c.getAiChanges() : List.of())
                .impact(c.getAiImpact())
                .type(c.getAiType())
                .filesChanged(c.getAiFilesChanged() != null ? c.getAiFilesChanged() : 0)
                .totalAdditions(c.getAiAdditions() != null ? c.getAiAdditions() : 0)
                .totalDeletions(c.getAiDeletions() != null ? c.getAiDeletions() : 0)
                .build();
    }

    private CommitSummaryResponse buildAndCallGroq(String commitHash, JsonNode commitData) {
        JsonNode commit = commitData.has("commit") ? commitData.get("commit") : commitData;
        String message = commit.path("message").asText("");
        String author = commit.path("author").path("name").asText("");

        JsonNode filesNode = commitData.has("files") ? commitData.get("files") : null;
        int totalAdditions = 0, totalDeletions = 0, filesChanged = 0;
        StringBuilder diffBuilder = new StringBuilder();

        if (filesNode != null && filesNode.isArray()) {
            filesChanged = filesNode.size();
            for (JsonNode file : filesNode) {
                totalAdditions += file.path("additions").asInt(0);
                totalDeletions += file.path("deletions").asInt(0);

                diffBuilder.append("File: ").append(file.path("filename").asText())
                        .append(" [").append(file.path("status").asText()).append("] ")
                        .append("+").append(file.path("additions").asInt(0))
                        .append(" -").append(file.path("deletions").asInt(0))
                        .append("\n");

                String patch = file.path("patch").asText("");
                if (!patch.isEmpty() && diffBuilder.length() < MAX_DIFF_CHARS) {
                    int remaining = MAX_DIFF_CHARS - diffBuilder.length();
                    diffBuilder.append(patch, 0, Math.min(patch.length(), remaining)).append("\n\n");
                }
            }
        }

        String prompt = buildPrompt(message, author, filesChanged, totalAdditions, totalDeletions, diffBuilder.toString());
        JsonNode groqResponse = callGroq(prompt);
        return parseGroqResponse(groqResponse, commitHash, filesChanged, totalAdditions, totalDeletions, message);
    }

    private String buildPrompt(String commitMessage, String author, int filesChanged,
                                int additions, int deletions, String diff) {
        return """
                Analyze this git commit's actual code changes and produce a structured summary.
                Focus on what the code ACTUALLY does — not just the commit message.

                Commit Message: %s
                Author: %s
                Files Changed: %d (+%d / -%d lines)

                Code Diff:
                %s

                Respond with ONLY valid JSON (no markdown, no explanation):
                {
                  "summary": "One clear sentence describing what this commit actually implements or fixes",
                  "changes": [
                    "Specific change 1 based on the code",
                    "Specific change 2 based on the code"
                  ],
                  "impact": "Low|Medium|High",
                  "type": "Feature|Fix|Refactor|Test|Docs|Chore|Style"
                }

                Rules:
                - summary must reflect actual code changes, not just repeat the commit message
                - changes list: 2-5 specific bullet points derived from the diff
                - impact: Low (small fix/style), Medium (new functionality), High (architecture/breaking)
                - type: pick the single best category
                """.formatted(commitMessage, author, filesChanged, additions, deletions, diff);
    }

    private JsonNode callGroq(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> body = Map.of(
                "model", GROQ_MODEL,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 1024,
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object")
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<JsonNode> response = rest.exchange(GROQ_API_URL, HttpMethod.POST, request, JsonNode.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        }
        throw new RuntimeException("Groq API returned: " + response.getStatusCode());
    }

    private CommitSummaryResponse parseGroqResponse(JsonNode groqResponse, String commitHash,
                                                     int filesChanged, int additions, int deletions,
                                                     String fallbackMessage) {
        try {
            String content = groqResponse.path("choices").get(0).path("message").path("content").asText("");
            JsonNode parsed = objectMapper.readTree(content);

            List<String> changes = new ArrayList<>();
            parsed.path("changes").forEach(c -> changes.add(c.asText()));

            return CommitSummaryResponse.builder()
                    .commitHash(commitHash)
                    .summary(parsed.path("summary").asText(fallbackMessage))
                    .changes(changes)
                    .impact(parsed.path("impact").asText("Medium"))
                    .type(parsed.path("type").asText("Chore"))
                    .filesChanged(filesChanged)
                    .totalAdditions(additions)
                    .totalDeletions(deletions)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Groq response for commit {}: {}", commitHash, e.getMessage());
            return CommitSummaryResponse.builder()
                    .commitHash(commitHash)
                    .summary(fallbackMessage)
                    .changes(List.of("Analysis parsing failed"))
                    .impact("Medium").type("Chore")
                    .filesChanged(filesChanged)
                    .totalAdditions(additions)
                    .totalDeletions(deletions)
                    .build();
        }
    }

    @Async
    @Transactional
    public void generateAndStoreTechStackAsync(Long projectId, Long userId, String repoFullName) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("[TechStack] Groq API key not set — skipping tech stack generation for project {}", projectId);
            return;
        }
        log.info("[TechStack] Starting tech stack generation for project {} ({})", projectId, repoFullName);
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

            if (!project.getTechStack().isEmpty()) {
                log.info("[TechStack] Project {} already has tech stack — skipping", projectId);
                return;
            }

            String installationToken = resolveInstallationToken(repoFullName.split("/")[0], userId);
            JsonNode tree = gitHubService.getRepositoryTree(repoFullName, null, installationToken);
            StringBuilder filePaths = new StringBuilder();
            JsonNode treeItems = tree.has("tree") ? tree.get("tree") : tree;
            if (treeItems.isArray()) {
                int count = 0;
                for (JsonNode item : treeItems) {
                    String path = item.path("path").asText();
                    if (!path.isEmpty() && count < 300) {
                        filePaths.append(path).append("\n");
                        count++;
                    }
                }
            }

            if (filePaths.length() == 0) {
                log.warn("[TechStack] No file paths found for project {}", projectId);
                return;
            }

            log.info("[TechStack] Sending {} file paths to Groq for tech stack detection", filePaths.toString().split("\n").length);
            JsonNode groqResponse = callGroq(buildTechStackPrompt(filePaths.toString()));
            List<String> techNames = parseTechStackResponse(groqResponse);
            log.info("[TechStack] Groq identified technologies: {}", techNames);

            for (String tech : techNames) {
                ProjectTechStack techEntry = projectTechStackRepository.findByTechnology(tech)
                        .orElseGet(() -> projectTechStackRepository.save(
                                ProjectTechStack.builder().technology(tech).projects(new ArrayList<>()).build()
                        ));
                if (!project.getTechStack().contains(techEntry)) {
                    project.getTechStack().add(techEntry);
                }
            }
            projectRepository.save(project);
            log.info("[TechStack] Saved {} technologies for project {}", techNames.size(), projectId);

        } catch (Exception e) {
            log.error("[TechStack] Failed to generate tech stack for project {}: {}", projectId, e.getMessage());
        }
    }

    private String buildTechStackPrompt(String filePaths) {
        return """
                Analyze these repository file paths and identify all technologies, frameworks, and tools used.

                File paths:
                %s

                Return ONLY valid JSON (no markdown, no explanation):
                {"techStack": ["React", "TypeScript", ...]}

                You MUST use ONLY these exact names, character-for-character (case-sensitive, punctuation-exact):
                React, Next.js, Vue.js, Angular, Svelte, Gatsby,
                TypeScript, JavaScript, Python, Java, Go, Rust, Kotlin, Swift, Dart, PHP, HTML, CSS,
                Flutter, React Native, Expo,
                TailwindCSS, SASS, Bootstrap, MUI,
                Node.js, Express, NestJS, Fastify, Spring, Django, Flask, FastAPI,
                PostgreSQL, MySQL, SQLite, MongoDB, Redis, Elasticsearch, Firebase, Supabase, Prisma,
                GraphQL, Redux, React Router, OpenAI,
                Docker, Kubernetes, AWS, Google Cloud, Azure, Vercel, Netlify, Nginx, Linux,
                RabbitMQ, Kafka,
                Webpack, Vite, ESLint, Prettier, Jest, Cypress, Storybook,
                Git, GitHub, GitLab

                Critical naming rules (do NOT deviate):
                - "Spring" NOT "Spring Boot" or "Spring Framework"
                - "TailwindCSS" NOT "Tailwind CSS" or "Tailwind"
                - "NestJS" NOT "Nest.js" or "NestJs"
                - "Node.js" NOT "NodeJS" or "Node"
                - "Next.js" NOT "NextJS" or "Next"
                - "Vue.js" NOT "VueJS" or "Vue"
                - "FastAPI" NOT "Fast API"
                - "GraphQL" NOT "Graph QL"
                - Only include technologies clearly evidenced by the file paths
                - Return 3-12 technologies maximum, no duplicates
                - If a technology is not in the list above, do NOT include it
                """.formatted(filePaths);
    }

    private List<String> parseTechStackResponse(JsonNode groqResponse) {
        try {
            String content = groqResponse.path("choices").get(0).path("message").path("content").asText("");
            JsonNode parsed = objectMapper.readTree(content);
            List<String> techs = new ArrayList<>();
            parsed.path("techStack").forEach(t -> techs.add(t.asText()));
            return techs;
        } catch (Exception e) {
            log.error("[TechStack] Failed to parse Groq response: {}", e.getMessage());
            return List.of();
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
