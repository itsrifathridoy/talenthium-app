package tech.talenthium.authservice.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.authservice.validator.UniqueCompanyNameValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueCompanyNameValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueCompanyName {
    String message() default "Company name must be unique";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
