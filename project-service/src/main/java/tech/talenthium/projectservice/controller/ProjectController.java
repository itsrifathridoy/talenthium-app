package tech.talenthium.projectservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.talenthium.projectservice.dto.request.ProjectCreateRequest;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.service.ProjectService;
@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    @PostMapping("/create")
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectCreateRequest request, @RequestHeader("X-USERID") Long userId) {
        log.info("Creating new project {}",request);
        Project project = projectService.createNewProject(request,userId);
        return ResponseEntity.ok(project);
    }

}
