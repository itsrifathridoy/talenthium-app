package tech.talenthium.authservice.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import tech.talenthium.authservice.validator.UniqueUserPhoneValidator;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = UniqueUserPhoneValidator.class)
@Target({ FIELD })
@Retention(RUNTIME)
public @interface UniqueUserPhone {
    String message() default "Phone already in use";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
