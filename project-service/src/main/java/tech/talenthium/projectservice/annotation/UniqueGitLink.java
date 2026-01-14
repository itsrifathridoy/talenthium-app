package tech.talenthium.projectservice.annotation;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.projectservice.validator.UniqueGitLinkValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueGitLinkValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueGitLink {
    String message() default "This git repo is already taken";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
