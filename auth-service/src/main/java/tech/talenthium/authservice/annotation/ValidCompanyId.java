package tech.talenthium.authservice.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.authservice.validator.CompanyIdValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = CompanyIdValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface ValidCompanyId {
    String message() default "Invalid company ID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
