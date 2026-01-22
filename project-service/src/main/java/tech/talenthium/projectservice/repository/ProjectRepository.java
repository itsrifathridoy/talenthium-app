package tech.talenthium.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tech.talenthium.projectservice.entity.Project;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    boolean existsProjectByGitLink(String gitLink);

    boolean existsProjectByLiveLink(String liveLink);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.contributors WHERE p.ownerId = :ownerId")
    List<Project> findByOwnerId(@Param("ownerId") Long ownerId);
}
