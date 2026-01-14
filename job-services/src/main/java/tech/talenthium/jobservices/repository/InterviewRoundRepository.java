package tech.talenthium.jobservices.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.talenthium.jobservices.dto.InterviewRoundResponse;
import tech.talenthium.jobservices.entity.InterviewRound;

import java.util.List;

@Repository
public interface InterviewRoundRepository extends JpaRepository<InterviewRound, Long> {
    // Update applications round by List of application_ids
    @Modifying
    @Query("UPDATE InterviewRound ir SET ir.round = :round WHERE ir.application IN :applicationIds AND ir.status=tech.talenthium.jobservices.entity.InterviewRound.Status.COMPLETED")
    int updateStatusByIds(@Param("status") InterviewRound.Round round, @Param("applicationIds") List<Long> applicationIds);

    @Query("SELECT ir FROM InterviewRound ir WHERE ir.application.candidateId = :candidateId ORDER BY ir.createdAt DESC")
    List<InterviewRound> findByApplication_CandidateOrderByCreatedAtDesc(@Param("candidateId") Long candidateId);

//    @Modifying
//    @Query("UPDATE InterviewRound ir set ir.status=InterviewRound.Status.DISQUALIFY WHERE ir.application.job.id = :jobId and ir.id NOT IN :ids ORDER BY ir.createdAt DESC")
//    void updateByJobIdAndIdNotIn(@Param("jobId") Long jobId, @Param("ids") List<Long> ids);
//
//    List<InterviewRoundResponse> uByJobIdAndIdNotIn(Collection<Long> ids);
}
