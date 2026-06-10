package tech.talenthium.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.projectservice.entity.ProjectTechStack;

import java.util.Optional;

public interface ProjectTechStackRepository extends JpaRepository<ProjectTechStack, Long> {
    Optional<ProjectTechStack> findByTechnology(String technology);
}
