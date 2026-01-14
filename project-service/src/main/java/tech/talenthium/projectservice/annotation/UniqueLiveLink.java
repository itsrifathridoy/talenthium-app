package tech.talenthium.projectservice.annotation;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.projectservice.validator.UniqueGitLinkValidator;
import tech.talenthium.projectservice.validator.UniqueLiveLinkValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueLiveLinkValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueLiveLink {
    String message() default "This live link is already used by another project";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
