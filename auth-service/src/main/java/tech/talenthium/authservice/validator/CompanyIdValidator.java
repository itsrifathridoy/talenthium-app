package tech.talenthium.authservice.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import tech.talenthium.authservice.annotation.ValidCompanyId;
import tech.talenthium.authservice.service.CompanyService;

@Component
@RequiredArgsConstructor
public class CompanyIdValidator implements ConstraintValidator<ValidCompanyId, Long> {
    private final CompanyService companyService;

    @Override
    public boolean isValid(Long value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return companyService.existsById(value);
    }
}
