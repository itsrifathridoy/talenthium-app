package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tech.talenthium.projectservice.dto.response.FileContentResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service for validating GitHub repository files.
 * 
 * Example: Validates that package.json contains only strict versions (e.g., 1.2.3)
 * and not semver ranges (e.g., ^1.2.3, >=1.2.3, etc.)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class GitHubFileValidationService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Validates that all dependencies in package.json use strict versions.
     * Strict version means: exactly X.Y.Z format (e.g., 1.2.3)
     * Invalid formats include: ^1.2.3, >=1.2.3, 1.2.*, latest, etc.
     * 
     * @param fileContent The package.json file content from GitHub
     * @return ValidationResult with success flag and list of violations
     */
    public ValidationResult validateStrictDependencies(FileContentResponse fileContent) {
        try {
            JsonNode packageJson = objectMapper.readTree(fileContent.getContent());
            List<String> violations = new ArrayList<>();

            // Check dependencies
            JsonNode dependencies = packageJson.get("dependencies");
            if (dependencies != null && dependencies.isObject()) {
                violations.addAll(validateDependencyObject(dependencies, "dependencies"));
            }

            // Check devDependencies
            JsonNode devDependencies = packageJson.get("devDependencies");
            if (devDependencies != null && devDependencies.isObject()) {
                violations.addAll(validateDependencyObject(devDependencies, "devDependencies"));
            }

            // Check peerDependencies
            JsonNode peerDependencies = packageJson.get("peerDependencies");
            if (peerDependencies != null && peerDependencies.isObject()) {
                violations.addAll(validateDependencyObject(peerDependencies, "peerDependencies"));
            }

            boolean isValid = violations.isEmpty();
            log.info("Package.json validation result: {}", isValid ? "PASS" : "FAIL");

            return ValidationResult.builder()
                    .isValid(isValid)
                    .message(isValid ? "All dependencies use strict versions" : "Found semver ranges in dependencies")
                    .violations(violations)
                    .build();

        } catch (Exception e) {
            log.error("Error validating package.json", e);
            return ValidationResult.builder()
                    .isValid(false)
                    .message("Error parsing package.json: " + e.getMessage())
                    .violations(List.of("Parse error: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Validates a dependency object (dependencies, devDependencies, etc.)
     * 
     * @param dependencyObject The dependency object from package.json
     * @param dependencyType The type of dependencies (for error messages)
     * @return List of violation messages
     */
    private List<String> validateDependencyObject(JsonNode dependencyObject, String dependencyType) {
        List<String> violations = new ArrayList<>();
        
        // Pattern for strict versions: X.Y.Z where X, Y, Z are digits
        Pattern strictVersionPattern = Pattern.compile("^\\d+\\.\\d+\\.\\d+$");

        dependencyObject.fields().forEachRemaining(entry -> {
            String packageName = entry.getKey();
            String version = entry.getValue().asText();

            if (!isStrictVersion(version)) {
                violations.add(String.format("%s: %s uses non-strict version '%s'", 
                    dependencyType, packageName, version));
            }
        });

        return violations;
    }

    /**
     * Checks if a version string is a strict version (X.Y.Z format)
     * 
     * Valid: 1.2.3, 0.0.1, 10.20.30
     * Invalid: ^1.2.3, >=1.2.3, ~1.2.3, *, latest, 1.2.x
     * 
     * @param version The version string to check
     * @return true if version is strict, false otherwise
     */
    private boolean isStrictVersion(String version) {
        // Pattern for strict semantic versioning: X.Y.Z
        return version.matches("^\\d+\\.\\d+\\.\\d+$");
    }

    /**
     * DTO for validation results
     */
    public static class ValidationResult {
        public boolean isValid;
        public String message;
        public List<String> violations;

        public ValidationResult() {}

        public ValidationResult(boolean isValid, String message, List<String> violations) {
            this.isValid = isValid;
            this.message = message;
            this.violations = violations;
        }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private boolean isValid;
            private String message;
            private List<String> violations;

            public Builder isValid(boolean isValid) {
                this.isValid = isValid;
                return this;
            }

            public Builder message(String message) {
                this.message = message;
                return this;
            }

            public Builder violations(List<String> violations) {
                this.violations = violations;
                return this;
            }

            public ValidationResult build() {
                return new ValidationResult(isValid, message, violations);
            }
        }

        public boolean isValid() {
            return isValid;
        }

        public String getMessage() {
            return message;
        }

        public List<String> getViolations() {
            return violations;
        }
    }
}
