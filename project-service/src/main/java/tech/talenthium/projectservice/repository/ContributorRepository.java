package tech.talenthium.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.talenthium.projectservice.entity.Contributor;
import tech.talenthium.projectservice.entity.Project;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContributorRepository extends JpaRepository<Contributor, Long> {
    List<Contributor> findByProject(Project project);
    Optional<Contributor> findByProjectAndGithubUsername(Project project, String githubUsername);
}
