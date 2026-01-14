package tech.talenthium.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.projectservice.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    boolean existsProjectByGitLink(String gitLink);

    boolean existsProjectByLiveLink(String liveLink);
}
