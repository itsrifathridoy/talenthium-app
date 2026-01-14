package tech.talenthium.authservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tech.talenthium.authservice.annotation.UniqueCompanyPhone;
import tech.talenthium.authservice.repository.CompanyRepository;

@Component
@RequiredArgsConstructor
public class UniqueCompanyPhoneValidator implements ConstraintValidator<UniqueCompanyPhone, String> {
    private final CompanyRepository companyRepository;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) return true;
        return !companyRepository.existsByPhone(value);
    }
}
