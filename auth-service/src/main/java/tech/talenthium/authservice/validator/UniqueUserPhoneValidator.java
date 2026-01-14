package tech.talenthium.authservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tech.talenthium.authservice.annotation.UniqueUserPhone;
import tech.talenthium.authservice.service.UserService;

@Component
@RequiredArgsConstructor
public class UniqueUserPhoneValidator implements ConstraintValidator<UniqueUserPhone, String> {
    private final UserService userService;
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;
        return !userService.phoneExists(value);
    }
}
