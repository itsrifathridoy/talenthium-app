package tech.talenthium.projectservice.annotation;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.projectservice.validator.URLValidator;
import tech.talenthium.projectservice.validator.UniqueGitLinkValidator;
import tech.talenthium.projectservice.validator.UniqueLiveLinkValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = URLValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface ValidURL {
    String message() default "Invalid URL";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
