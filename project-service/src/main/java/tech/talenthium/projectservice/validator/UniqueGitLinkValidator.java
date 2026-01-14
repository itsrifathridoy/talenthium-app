package tech.talenthium.projectservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import tech.talenthium.projectservice.annotation.UniqueGitLink;
import tech.talenthium.projectservice.repository.ProjectRepository;

@Component
@RequiredArgsConstructor
public class UniqueGitLinkValidator implements ConstraintValidator<UniqueGitLink, String> {
    private final ProjectRepository projectRepository;
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) return true;
        return !projectRepository.existsProjectByGitLink(value);
    }
}