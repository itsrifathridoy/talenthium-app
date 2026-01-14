package tech.talenthium.projectservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestHeader;
import tech.talenthium.projectservice.dto.request.ProjectCreateRequest;
import tech.talenthium.projectservice.entity.Project;
import tech.talenthium.projectservice.repository.ProjectRepository;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;

    @Transactional
    public Project createNewProject(ProjectCreateRequest body,Long userId) {
       return projectRepository.save(body.toEntity(userId));
    }
}
