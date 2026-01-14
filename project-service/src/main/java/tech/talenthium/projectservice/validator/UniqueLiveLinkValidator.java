package tech.talenthium.projectservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tech.talenthium.projectservice.annotation.UniqueLiveLink;
import tech.talenthium.projectservice.repository.ProjectRepository;

import java.net.URI;
import java.net.URISyntaxException;

import static tech.talenthium.projectservice.helper.UrlHelper.normalizeUri;

@Slf4j
@Component
@RequiredArgsConstructor
public class UniqueLiveLinkValidator implements ConstraintValidator<UniqueLiveLink, String> {

    private final ProjectRepository projectRepository;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // @NotNull or @NotBlank should handle null/empty
        }

        try {
            String candidate = value.trim();

            // Prepend default scheme if missing
            if (!candidate.matches("^(?i)(http|https)://.*$")) {
                candidate = "https://" + candidate;
            }

            URI uri = new URI(candidate);

            if (uri.getHost() == null) {
                return false;
            }

            String normalized = normalizeUri(uri);

            log.info("Normalized liveLink: {}", normalized);

            return !projectRepository.existsProjectByLiveLink(normalized);

        } catch (URISyntaxException e) {
            log.error("Invalid URI: {}", value, e);
            return false;
        }
    }
}
