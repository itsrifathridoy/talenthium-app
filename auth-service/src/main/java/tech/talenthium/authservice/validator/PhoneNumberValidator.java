package tech.talenthium.authservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import tech.talenthium.authservice.annotation.ValidPhoneNumber;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private static final String BANGLADESH_PHONE_REGEX = "^(\\+8801|8801|01)[3-9]\\d{8}$";

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext context) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return phone.matches(BANGLADESH_PHONE_REGEX);
    }
}
