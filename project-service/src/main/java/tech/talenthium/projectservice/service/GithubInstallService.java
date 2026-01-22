package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tech.talenthium.projectservice.entity.GithubAppInstallation;
import tech.talenthium.projectservice.exception.NotFoundException;
import tech.talenthium.projectservice.repository.GithubInstallRepo;

@Service
@RequiredArgsConstructor
public class GithubInstallService {
    private final GithubInstallRepo githubInstallRepo;

    public GithubAppInstallation getGithubInstallation(long ownerId){
        return githubInstallRepo.findByOwnerId(ownerId)
                .orElseThrow(()->
                        new NotFoundException("You're not connect to any github account yet.")
                        );
    }

    @Transactional
    public void deleteGithubInstallation(long ownerId) {
        githubInstallRepo.findByOwnerId(ownerId).ifPresent(githubInstallRepo::delete);
    }
    @Transactional
    public void saveGithubInstallation(String installationId, long ownerId, JsonNode repos){
        // Check if installation already exists for this owner
        GithubAppInstallation installation = githubInstallRepo.findByOwnerId(ownerId)
                .orElse(GithubAppInstallation.builder()
                        .ownerId(ownerId)
                        .build());

        // Update the installation details
        installation.setInstallationId(installationId);
        installation.setRepositories(repos);

        githubInstallRepo.save(installation);
    }
}
