package tech.talenthium.jobservices.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.jobservices.entity.CandidateResponse;
import tech.talenthium.jobservices.entity.InterviewRound;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.entity.Question;

import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    Optional<Question> findByJobAndRound(Job job, InterviewRound.Round round);
}
