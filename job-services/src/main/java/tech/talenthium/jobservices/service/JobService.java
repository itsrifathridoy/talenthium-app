package tech.talenthium.jobservices.service;


//import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.jobservices.dto.JobRequest;
import tech.talenthium.jobservices.dto.JobResponse;
import tech.talenthium.jobservices.dto.JobUpdateRequest;
import tech.talenthium.jobservices.entity.Job;
import tech.talenthium.jobservices.exception.NotFoundException;
import tech.talenthium.jobservices.repository.JobRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class JobService {
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // Create a new job
    @Transactional
    public JobResponse createJob(JobRequest job, Long recruiterId) {
        Job newJob = Job.builder()
                .title(job.getTitle())
                .companyName(job.getCompanyName())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .salaryRange(job.getSalaryRange())
                .descriptionMarkdown(job.getDescriptionMarkdown())
                .skills(job.getSkills())
                .workingHours(job.getWorkingHours())
                .experienceLevel(job.getExperienceLevel())
                .expiresAt(job.getExpiresAt())
                .recruiterId(recruiterId)
                .build();
        return createJobResponse(jobRepository.save(newJob));
    }

    // List all jobs posted by a specific recruiter
    @Transactional(readOnly = true)
    public List<JobResponse> getRecruiterJob(Long recruiterId) {
        List<Job> jobs=jobRepository.findByRecruiterIdOrderByPostedAtDesc(recruiterId);
        List<JobResponse> jobResponse=new ArrayList<>();
        for(Job job:jobs){
            jobResponse.add(createJobResponse(job));
        }
        return jobResponse;
    }

    // Update a job if the recruiter is the owner
    @Transactional
    public JobResponse updateJob(Long id, JobUpdateRequest updatedJob, Long recruiterId) {

        Job existingJob = jobRepository.findByIdAndRecruiterId(id, recruiterId).orElseThrow(() ->
                new NotFoundException("Job not found or you are not authorized to update this job."));
        // Update only the fields that are provided in updatedJob
        if(updatedJob.getTitle()!=null){
            existingJob.setTitle(updatedJob.getTitle());
        }
        if(updatedJob.getCompanyName()!=null){
            existingJob.setCompanyName(updatedJob.getCompanyName());
        }
        if(updatedJob.getLocation()!=null){
            existingJob.setLocation(updatedJob.getLocation());
        }
        if(updatedJob.getJobType()!=null){
            existingJob.setJobType(updatedJob.getJobType());
        }
        if(updatedJob.getSalaryRange()!=null){
            existingJob.setSalaryRange(updatedJob.getSalaryRange());
        }
        if(updatedJob.getWorkingHours()!=null){
            existingJob.setWorkingHours(updatedJob.getWorkingHours());
        }
        if(updatedJob.getDescriptionMarkdown()!=null){
            existingJob.setDescriptionMarkdown(updatedJob.getDescriptionMarkdown());
        }
        if(updatedJob.getSkills()!=null){
            existingJob.setSkills(updatedJob.getSkills());
        }
        if(updatedJob.getExperienceLevel()!=null){
            existingJob.setExperienceLevel(updatedJob.getExperienceLevel());
        }
        if(updatedJob.getExpiresAt()!=null){
            existingJob.setExpiresAt(updatedJob.getExpiresAt());
        }
        jobRepository.save(existingJob);
        return createJobResponse(existingJob);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllActiveJob() {
        List<Job>jobs=jobRepository.findByActiveTrueOrderByPostedAtDesc();
        List<JobResponse> jobResponse=new ArrayList<>();
        for(Job job:jobs){
            jobResponse.add(createJobResponse(job));
        }
        return jobResponse;
    }

    public JobResponse getJobById(Long id) {
        return jobRepository.findById(id)
                .map(this::createJobResponse)
                .orElseThrow(() -> new NotFoundException("Job not found with ID: " + id));
    }

    public JobResponse getJobByIdAndRecruiter(Long id, Long recruiterId) {
        return jobRepository.findByIdAndRecruiterId(id, recruiterId)
                .map(j -> JobResponse.builder()
                        .id(j.getId())
                        .recruiterId(j.getRecruiterId())
                        .title(j.getTitle())
                        .descriptionMarkdown(j.getDescriptionMarkdown())
                        .location(j.getLocation())
                        .jobType(j.getJobType())
                        .experienceLevel(j.getExperienceLevel())
                        .skills(j.getSkills())
                        .salaryRange(j.getSalaryRange())
                        .active(j.isActive())
                        .postedAt(j.getPostedAt())
                        .expiresAt(j.getExpiresAt())
                        .build())
                .orElseThrow(() -> new NotFoundException("Job not found!"));
    }
    JobResponse createJobResponse(Job job){
        return JobResponse.builder()
                .id(job.getId())
                .recruiterId(job.getRecruiterId())
                .title(job.getTitle())
                .descriptionMarkdown(job.getDescriptionMarkdown())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .skills(job.getSkills())
                .salaryRange(job.getSalaryRange())
                .active(job.isActive())
                .postedAt(job.getPostedAt())
                .expiresAt(job.getExpiresAt())
                .build();
    }
}
