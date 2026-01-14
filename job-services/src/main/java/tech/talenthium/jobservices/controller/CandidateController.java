package tech.talenthium.jobservices.controller;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.talenthium.jobservices.annotation.RequireRole;
import tech.talenthium.jobservices.dto.CandidateRoundResponse;
import tech.talenthium.jobservices.dto.InterviewRoundResponse;
import tech.talenthium.jobservices.dto.JobApplicationResponse;
import tech.talenthium.jobservices.dto.JobResponse;
import tech.talenthium.jobservices.entity.InterviewRound;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.entity.Question;
import tech.talenthium.jobservices.service.JobApplicationService;
import tech.talenthium.jobservices.service.JobService;

import java.util.List;

@RestController
@RequestMapping("/api/candidate")
public class CandidateController {

    private static final Logger log = LoggerFactory.getLogger(CandidateController.class);
    private final JobService jobService;
    private final JobApplicationService jobApplicationService;

    public CandidateController(JobService jobService, JobApplicationService jobApplicationService) {
        this.jobService = jobService;
        this.jobApplicationService = jobApplicationService;
    }

    // POST /api/candidate/applyjob: Apply for a job
    @RequireRole("DEVELOPER")
    @PostMapping("/applyjob")
    public ResponseEntity<JobApplicationResponse> applyForJob(
            @Valid
            @RequestParam Long jobId,
            HttpServletRequest httpServletRequest) {
        Long candidateId =Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        JobApplicationResponse response = jobApplicationService.applyForJob(jobId, candidateId);
        return ResponseEntity.ok(response);
    }


    // GET /api/candidate/seeAppliedJob: List all Job the candidate has applied for
    @RequireRole("DEVELOPER")
    @GetMapping("/seeAppliedJob")
    public ResponseEntity<List<JobApplicationResponse>> getAppliedJob(
            HttpServletRequest httpServletRequest
    ) {

        Long candidateId= Long.parseLong(httpServletRequest.getHeader("X-USERID"));

        List<JobApplicationResponse> applications = jobApplicationService.getCandidateApplications(candidateId);
        return ResponseEntity.ok(applications);
    }

    @RequireRole("DEVELOPER")
    @GetMapping("/interviews")
    public ResponseEntity<List<?>> getInterviewJobs(
            HttpServletRequest httpServletRequest) {
        Long candidateId= Long.parseLong(httpServletRequest.getHeader("X-USERID"));
        List<InterviewRoundResponse> applications = jobApplicationService.getCandidateInterviewApplications(candidateId);
        return ResponseEntity.ok(applications);
    }

//    @RequireRole("CANDIDATE")
//    @PostMapping("/interviews/{id}")//interview round id
//    public ResponseEntity<String> attemptInterviewRound(
//            @Valid
//            @RequestBody CandidateRoundResponse candidateRoundResponse,
//            @PathVariable Long id,//round id
//            @RequestHeader("X-USERID") Long candidateId) {
//        String response=jobApplicationService.attemptInterviewRound(id, candidateId, candidateRoundResponse);
//        if(response.equals("success")){
//            return ResponseEntity.ok("Interview round attempted successfully");
//        }else{
//            return ResponseEntity.badRequest().body(response);
//        }
//    }


    @RequireRole("DEVELOPER")
    @PostMapping("/interviews/{round_id}")//interview round id
    public ResponseEntity<?> attemptInterviewRound(
            @Valid
            @PathVariable Long round_id,//round id
            @RequestHeader("X-USERID") Long candidateId) {
        Question response=jobApplicationService.attemptInterviewRound(round_id, candidateId);
        log.info("response{}",response);
        if(response!=null){
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.badRequest().body("Error in attempting interview round");
        }
    }
}
