package tech.talenthium.jobservices.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.jobservices.entity.CandidateResponse;
import tech.talenthium.jobservices.entity.JobApplication;

public interface CandidateResponseRepository extends JpaRepository<CandidateResponse, Long> {
}
