package tech.talenthium.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.projectservice.entity.GithubAppInstallation;

import java.util.Optional;

public interface GithubInstallRepo extends JpaRepository<GithubAppInstallation, Long> {

    Optional<GithubAppInstallation> findByOwnerId(long ownerId);

    Optional<GithubAppInstallation> findByInstallationId(String installationId);
}
