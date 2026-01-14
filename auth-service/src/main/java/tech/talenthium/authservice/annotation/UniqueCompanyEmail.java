package tech.talenthium.authservice.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.authservice.validator.UniqueCompanyEmailValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueCompanyEmailValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueCompanyEmail {
    String message() default "Company email must be unique";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
