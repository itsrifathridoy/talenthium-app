package tech.talenthium.authservice.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.authservice.validator.UniqueCompanyWebsiteValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueCompanyWebsiteValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueCompanyWebsite {
    String message() default "Company website must be unique";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
