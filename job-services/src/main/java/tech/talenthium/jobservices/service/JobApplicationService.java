package tech.talenthium.jobservices.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tech.talenthium.jobservices.annotation.RequireRole;
import tech.talenthium.jobservices.dto.*;
import tech.talenthium.jobservices.entity.InterviewRound;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.entity.Question;
import tech.talenthium.jobservices.entity.JobApplication;
import tech.talenthium.jobservices.entity.CandidateResponse;
import tech.talenthium.jobservices.exception.ForbiddenErrorException;
import tech.talenthium.jobservices.exception.NotFoundException;
import tech.talenthium.jobservices.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationService.class);
    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository JobRepository;
    private final InterviewRoundRepository interviewRoundRepository;
    private final CandidateResponseRepository candidateResponseRepository;
    private final QuestionRepository questionRepository;

//    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
//            JobRepository JobRepository, InterviewRoundRepository interviewRoundRepository, CandidateResponseRepository candidateResponseRepository) {
//        this.jobApplicationRepository = jobApplicationRepository;
//        this.JobRepository = JobRepository;
//        this.interviewRoundRepository=interviewRoundRepository;
//        this.candidateResponseRepository=candidateResponseRepository;
//    }

    public JobApplicationResponse applyForJob(Long jobId, Long candidateId) {
        Job job = JobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // Check if job is active
        if (!job.isActive()) {
            throw new RuntimeException("This job is no longer accepting applications");
        }

        // Check if candidate has already applied
        if (jobApplicationRepository.findByJobIdAndCandidateId(jobId,candidateId).isPresent()) {
            throw new RuntimeException("You have already applied for this job");
        }

        // Prevent recruiters from applying to their own Job
        if (job.getRecruiterId().equals(candidateId)) {
            throw new RuntimeException("Recruiters cannot apply to their own Job");
        }
        System.out.println("Check passed, proceeding to apply");
        JobApplication application = JobApplication.builder()
                .job(job)
                .candidateId(candidateId)
                .build();

        JobApplication savedApplication = jobApplicationRepository.save(application);
        return mapToResponse(savedApplication);
    }

    public List<JobApplicationResponse> getCandidateApplications(Long candidateId) {
        List<JobApplication> applications = jobApplicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateId);
        return applications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //applicants of a job posted by the recruiter
    public List<JobApplicationResponse> getApplicants(Long recruiterId, Long id) {
        List<JobApplication> applications = jobApplicationRepository.findByJobRecruiterIdAndJobIdOrderByAppliedAtDesc(recruiterId,id);
        return applications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //selected_ids will contain all the application_id of only selected candidate
    public List<InterviewRoundResponse> selectForInterview(Long jobId, List<Long>selected_ids, Long recruiterId){
        // Verify the recruiter owns the job
        JobRepository.findByIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(
                        () -> new RuntimeException("Job not found or you don't have permission to manage this job"+jobId+" "+recruiterId));

        //check wheather all the application id's right or not
        List<JobApplication> applications = jobApplicationRepository.findAllById(selected_ids);
        if (applications.size() != selected_ids.size()) {
            throw new RuntimeException("Some applications not found");
        }
        for (JobApplication app : applications) {
            if (!app.getJob().getId().equals(jobId)) {
                throw new RuntimeException("Application does not belong to the specified job");
            }
        }

        // Move to next round
        int updated_row=jobApplicationRepository.updateStatusByIds(JobApplication.ApplicationStatus.ACCEPTED,selected_ids);

        // Now create entity in InterviewRound Table for each candidate
        List<InterviewRound> rounds = applications.stream()
                .map(app -> InterviewRound.builder()
                        .application(app)
//                        .round(roundType) // no need of this cause for the first time screening will be selected
//                        .createdAt(LocalDateTime.now())
//                        .status(InterviewRound.Status.NOT_COMPLETED)
                        .build())
                .collect(Collectors.toList());
        interviewRoundRepository.saveAll(rounds);

        return rounds.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //sendNextRound will contain all the round details of only selected candidate
    public List<InterviewRoundResponse> moveToNextRound(SendNextRound sendNextRound, Long recruiterId) {

        //check wheather all the application id's right or not
        List<InterviewRound> rounds = interviewRoundRepository.findAllById(sendNextRound.getSelected_ids());
//        //--------------------------------------------------------------------------------------------------
//        for(InterviewRound round : rounds){
//            System.out.println(round.getId()+" "+round.getApplication().getId()+" "+round.getRound());
//        }
//        //--------------------------------------------------------------------------------------------------
        if (rounds.size() != sendNextRound.getSelected_ids().size()) {
            throw new RuntimeException("Some Interview not found");
        }

        // Move to next round (implement getNextRound logic as needed)
        for( InterviewRound round : rounds){
            InterviewRound.Round nextRound = getNextRound(round.getRound());
            if (nextRound == null) {
                throw new RuntimeException("Already in final round or no next round available");
            }
            if(!round.getApplication().getJob().getRecruiterId().equals(recruiterId)){
                throw new RuntimeException("You don't have permission to manage this interview round");
            }
            round.setRound(nextRound);
            round.setStatus(InterviewRound.Status.NOT_COMPLETED); //change this cause next round is not completed yet
            round.setInterviewDate(sendNextRound.getInterviewDate()); // change interview date
            round.setDuration(sendNextRound.getDuration()); //change duration
            round.setCreatedAt(LocalDateTime.now());
        }

        // Save all updated rounds
        List<InterviewRound> updated_rounds = interviewRoundRepository.saveAll(rounds);

        // Now update rejected applications status to REJECTED
//        interviewRoundRepository.updateByJobIdAndIdNotIn(
//                sendNextRound.getJobId(), sendNextRound.getSelected_ids());

        return updated_rounds.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    public List<InterviewRoundResponse> getCandidateInterviewApplications(Long candidateId) {
        return interviewRoundRepository.findByApplication_CandidateOrderByCreatedAtDesc(candidateId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        //return interviewRoundRepository.findByApplication_CandidateOrderByCreatedAtDesc(candidateId);
    }
    public String responseInterviewRound( Long roundId,Long candidateId, CandidateRoundResponse candidateRoundResponse) {
        InterviewRound round = interviewRoundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Interview round not found with ID: " + roundId));

        // Verify the candidate owns the application
        if (!round.getApplication().getCandidateId().equals(candidateId)) {
            throw new RuntimeException("You don't have permission to attempt this interview round");
        }

        // Check if the round is already completed
        if (round.getStatus() == InterviewRound.Status.COMPLETED) {
            throw new RuntimeException("This interview round has already been completed");
        }

        // Update the round details
        // round.setCandidateResponses(candidateRoundResponse.getCandidateResponses()); // store candidate responses
        round.setStatus(InterviewRound.Status.COMPLETED); // mark as completed
        interviewRoundRepository.save(round);
        CandidateResponse candidateResponse = CandidateResponse.builder()
                .interviewRound(round)
                .candidateResponses(candidateRoundResponse.getCandidateResponses())
                .round(round.getRound())
                .build();
        candidateResponseRepository.save(candidateResponse);
        return "success";
    }

    public Question attemptInterviewRound(Long roundId,Long candidateId){
        InterviewRound round = interviewRoundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Interview round not found with ID: " + roundId));

        if(!Objects.equals(candidateId, round.getApplication().getCandidateId())){
            throw new ForbiddenErrorException("You don't have permission to attempt this interview round");
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = round.getInterviewDate();
        LocalDateTime end = start.plus(round.getDuration());
        if (now.isBefore(start) || now.isAfter(end)) {
            log.info("Current time: {}, Interview time: {}, Duration: {}", now, start, round.getDuration());
            throw new ForbiddenErrorException("You can only attempt the interview during the scheduled time.");
        }
        if(round.getStatus().equals(InterviewRound.Status.COMPLETED)){
            throw new ForbiddenErrorException("You have already completed this interview round.");
        }
        return questionRepository.findByJobAndRound(round.getApplication().getJob(), round.getRound())
                .orElseThrow(() -> new NotFoundException("Questions not found for this round"));
    }
    // Recruiter will set question for the round
    @Transactional
    public String setQuestions(Long recruiterId, Long jobId,SetQuestionRequest request) {
        Job job = JobRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        // TODO: validate recruiterId matches job's recruiter

        if(!Objects.equals(job.getRecruiterId(), recruiterId)){
            throw new ForbiddenErrorException("You don't have permission to set questions for this job");
        }

        Question question = Question.builder()
                .job(job)
                .round(request.getRound())
                .questions(request.getQuestions())
                .build();

        questionRepository.save(question);
        return "Questions saved successfully";
    }

    private InterviewRound.Round getNextRound(InterviewRound.Round currentRound) {
        return switch (currentRound) {
            case SCREENING -> InterviewRound.Round.AI;
            case AI -> InterviewRound.Round.TECHNICAL;
            case TECHNICAL -> InterviewRound.Round.SELECTED;
            case SELECTED -> null; // No next round after FINAL
        };
    }

    private JobApplicationResponse mapToResponse(JobApplication application) {
        return JobApplicationResponse.builder()
                .id(application.getId())
                .jobId(application.getJob().getId())
                .candidateId(application.getCandidateId())
                .status(application.getStatus().toString())
                .recruiterId(application.getJob().getRecruiterId())
                .location(application.getJob().getLocation())
                .jobType(application.getJob().getJobType())
                .salaryRange(application.getJob().getSalaryRange())
                .workingHours(application.getJob().getWorkingHours())
                .descriptionMarkdown(application.getJob().getDescriptionMarkdown())
                .skills(application.getJob().getSkills())
                .experienceLevel(application.getJob().getExperienceLevel())
                .postedAt(application.getJob().getPostedAt())
                .expiresAt(application.getJob().getExpiresAt())
                .active(application.getJob().isActive())
                .companyName(application.getJob().getCompanyName())
                .status(application.getStatus().toString())
                .appliedAt(application.getAppliedAt())
                .build();
    }
    private InterviewRoundResponse mapToResponse(InterviewRound interviewRound){
        return InterviewRoundResponse.builder()
                .id(interviewRound.getId())
                .jobId(interviewRound.getApplication().getId())
                .round(interviewRound.getRound().toString())
                .interviewDate(interviewRound.getInterviewDate())
                .duration(interviewRound.getDuration())
                .appliedAt(interviewRound.getApplication().getAppliedAt())
                .createdAt(interviewRound.getCreatedAt())
                .build();
    }
}
