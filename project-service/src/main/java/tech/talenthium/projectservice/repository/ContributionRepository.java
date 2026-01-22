package tech.talenthium.projectservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.talenthium.projectservice.entity.Contribution;
import tech.talenthium.projectservice.entity.Project;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByProjectOrderByCommittedDateDesc(Project project);
    Optional<Contribution> findByCommitSha(String commitSha);
    boolean existsByCommitSha(String commitSha);
    boolean existsByCommitShaAndBranch(String commitSha, String branch);
}
