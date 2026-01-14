package tech.talenthium.authservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import tech.talenthium.authservice.annotation.ValidDateOfBirth;

import java.time.LocalDate;
import java.time.Period;

public class DateOfBirthValidator implements ConstraintValidator<ValidDateOfBirth, LocalDate> {

    private int minimumAge;

    @Override
    public void initialize(ValidDateOfBirth constraintAnnotation) {
        this.minimumAge = constraintAnnotation.minimumAge();
    }

    @Override
    public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
        if (dob == null) return false;

        LocalDate today = LocalDate.now();
        if (dob.isAfter(today)) return false;

        return Period.between(dob, today).getYears() >= minimumAge;
    }
}
