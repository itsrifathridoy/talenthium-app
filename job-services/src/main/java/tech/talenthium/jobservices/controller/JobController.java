package tech.talenthium.jobservices.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.talenthium.jobservices.dto.JobResponse;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.service.JobService;

import java.util.List;

@RestController
@RequestMapping("/api/job")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Get all active Job (public endpoint)
    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJob() {
        return ResponseEntity.ok(jobService.getAllActiveJob());
    }

    // Get job by ID (public endpoint)
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }


    //get jobs from the comapany

    //get similar jobs of this type
}
