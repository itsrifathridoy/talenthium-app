package tech.talenthium.projectservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import tech.talenthium.projectservice.annotation.UniqueGitLink;
import tech.talenthium.projectservice.annotation.ValidURL;
import tech.talenthium.projectservice.repository.ProjectRepository;

import java.net.URI;

@Component
@RequiredArgsConstructor
public class URLValidator implements ConstraintValidator<ValidURL, String> {

    // Simple domain regex (supports subdomains, TLDs, etc.)
    private static final String DOMAIN_REGEX =
            "^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // @NotNull or @NotBlank should handle null/empty
        }

        try {
            String urlToCheck = value.trim();

            // Add default scheme if missing
            if (!urlToCheck.matches("^(https?://).*")) {
                urlToCheck = "http://" + urlToCheck;
            }

            URI uri = new URI(urlToCheck);
            String host = uri.getHost();

            if (host == null || host.isEmpty()) {
                return false;
            }

            // Validate domain format
            return host.matches(DOMAIN_REGEX);

        } catch (Exception e) {
            return false;
        }
    }
}
