package tech.talenthium.jobservices.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tech.talenthium.jobservices.entity.Job;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
//    List<Job> findByRecruiterOrderByPostedAtDesc(User recruiter);

    List<Job> findByActiveTrueOrderByPostedAtDesc();

    Optional<Job> findByIdAndRecruiterId(Long id, Long recruiterId);

    Optional<Job> findByRecruiterId(Long recruiterId);

    @Query("SELECT j FROM Job j WHERE j.recruiterId = :recruiterId ORDER BY j.postedAt DESC")
    List<Job> findByRecruiterIdOrderByPostedAtDesc(Long recruiterId);
}
