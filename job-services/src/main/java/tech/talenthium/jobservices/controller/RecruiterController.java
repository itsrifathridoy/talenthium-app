package tech.talenthium.jobservices.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.talenthium.auth.AuthServiceProto;
import tech.talenthium.jobservices.annotation.RequireRole;
import tech.talenthium.jobservices.dto.DeveloperDto;
import tech.talenthium.jobservices.dto.InterviewRoundResponse;
import tech.talenthium.jobservices.dto.JobApplicationResponse;
import tech.talenthium.jobservices.dto.SendNextRound;
import tech.talenthium.jobservices.entity.Job;
//import tech.talenthium.jobservices.grpc.AuthServiceGrpcClient;
import tech.talenthium.jobservices.dto.*;
//import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.service.JobApplicationService;
import tech.talenthium.jobservices.service.JobService;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {

    private final JobService jobService;
    private final JobApplicationService jobApplicationService;
//    private final AuthServiceGrpcClient authServiceGrpcClient;


//    @GetMapping("/test/{id}")
//    public ResponseEntity<?> get(@PathVariable Long id) {
//        AuthServiceProto.DeveloperResponse grpcResponse = authServiceGrpcClient.getDeveloperById(id);
//
//        DeveloperDto dto = new DeveloperDto(
//                grpcResponse.getDeveloperId(),
//                grpcResponse.getUsername(),
//                grpcResponse.getName(),
//                grpcResponse.getEmail(),
//                grpcResponse.getPhone(),
//                grpcResponse.getAvatar(),
//                grpcResponse.getRole(),
//                grpcResponse.getIsActive(),
//                Instant.ofEpochSecond(grpcResponse.getDateOfBirth().getSeconds())
//                        .atZone(ZoneOffset.UTC)
//                        .toLocalDate()
//                        .toString()
//        );
//
//        return ResponseEntity.ok(grpcResponse.getName());
//    }
    // POST /api/recruiter/create: Create a job
    @RequireRole("RECRUITER")
    @PostMapping("/create")
    public ResponseEntity<JobResponse> createJob(
            @Valid
            @RequestBody JobRequest job,
            HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));

        JobResponse createdJob = jobService.createJob(job, recruiterId);
        return ResponseEntity.ok(createdJob);
    }

    // GET /api/recruiter/job: List all Job posted by the recruiter
    @RequireRole("RECRUITER")
    @GetMapping("/all-jobs")
    public ResponseEntity<List<JobResponse>> getMyJob(HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        List<JobResponse> job = jobService.getRecruiterJob(recruiterId);
        return ResponseEntity.ok(job);
    }

    // Unnecessary endpoint
    // GET /api/recruiter/job/{id}: View job details by ID
    @RequireRole("RECRUITER")
    @GetMapping("/job/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        JobResponse job = jobService.getJobByIdAndRecruiter(id, recruiterId);
        return ResponseEntity.ok(job);
    }

    // PUT /api/recruiter/job/edit/{id}: Edit a job if the recruiter is the owner
    @RequireRole("RECRUITER")
    @PutMapping("/job/edit/{id}")
    public ResponseEntity<JobResponse> editJob(
            @PathVariable Long id,
            @RequestBody JobUpdateRequest updatedJob,
            HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        JobResponse job = jobService.updateJob(id, updatedJob, recruiterId);
        return ResponseEntity.ok(job);
    }

    // GET /api/recruiter/applicants/{job_id}: List all applicants for a specific Job posted by the recruiter
    @RequireRole("RECRUITER")
    @GetMapping("/job/applicants/{job_id}")
    public ResponseEntity<List<JobApplicationResponse>> getApplicants(
            @PathVariable("job_id") Long jobId,
            HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        List<JobApplicationResponse> applications = jobApplicationService.getApplicants(recruiterId,jobId);
        return ResponseEntity.ok(applications);
    }

    // POST /api/recruiter/applicants/shortlist/{job_id}
    // applicant will be shortlisted using this portal
    @RequireRole("RECRUITER")
    @PostMapping("/job/applicants/shortList/{job_id}")
    public ResponseEntity<List<InterviewRoundResponse>> shortList(
            @PathVariable("job_id") Long jobId,
            @RequestBody List<Long>Selected_ids,
            HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        List<InterviewRoundResponse> response = jobApplicationService.selectForInterview(jobId,Selected_ids, recruiterId);
        return ResponseEntity.ok(response);
    }

    // POST /api/recruiter//job/applicants/nextRound
    // Applicant will be selected based on performance
    // selected_ids will contain all the application_id of only selected candidate
    @RequireRole("RECRUITER")
    @PostMapping("/job/applicants/nextRound/{job_id}")
    public ResponseEntity<List<InterviewRoundResponse>> nextRound(
            @Valid
            @PathVariable("job_id") Long jobId,
            @RequestBody SendNextRound sendNextRound,//this will contain selected_ids, interviewDate, duration
            HttpServletRequest httpServletRequest) {
        Long recruiterId=Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        List<InterviewRoundResponse>selected= jobApplicationService.moveToNextRound(sendNextRound,recruiterId); //no need to use jobId cause in interviewRound table there is already have a jobId
        return ResponseEntity.ok(selected);
    }
    // POST /api/recruiter/applicants/set_question/{round_id}
    // Recruiter will set question for the round// JobApplicationController.java
    @RequireRole("RECRUITER")
    @PostMapping("/job/set_question/{job_id}")
    public ResponseEntity<String> setQuestion(
            @PathVariable("job_id") Long jobId,
            @RequestBody SetQuestionRequest setQuestionRequest,
            @RequestHeader("X-USERID") Long recruiterId) {
        String response = jobApplicationService.setQuestions(recruiterId, jobId, setQuestionRequest);
        return ResponseEntity.ok(response);
    }
}
