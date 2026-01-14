package tech.talenthium.jobservices.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.entity.JobApplication;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    List<JobApplication> findByJobRecruiterIdOrderByAppliedAtDesc(Long recruiterId);

    List<JobApplication> findByJobRecruiterIdAndJobIdOrderByAppliedAtDesc(Long recruiterId, Long jobId);

    List<JobApplication> findByIdInOrderByAppliedAtDesc(List<Long> ids);

    List<JobApplication> findByJobOrderByAppliedAtDesc(Job job);

    List<JobApplication> findByJobAndJobRecruiterId(Job job, Long recruiterId);

    @Modifying
    @Transactional
    @Query("UPDATE JobApplication ja " +
            "SET ja.status = :status " +
            "WHERE ja.id IN :applicationIds " +
            "AND ja.status = tech.talenthium.jobservices.entity.JobApplication.ApplicationStatus.PENDING")
    int updateStatusByIds(@Param("status") JobApplication.ApplicationStatus status,
                          @Param("applicationIds") List<Long> applicationIds);

    Optional<JobApplication> findByJobIdAndCandidateId(Long jobId, Long candidateId);
}
