package tech.talenthium.authservice.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.authservice.validator.UniqueCompanyPhoneValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueCompanyPhoneValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueCompanyPhone {
    String message() default "Company phone must be unique";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
