package tech.talenthium.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.authservice.dto.request.CompanyRegisterRequest;
import tech.talenthium.authservice.dto.response.CompanyResponse;
import tech.talenthium.authservice.entity.Company;
import tech.talenthium.authservice.entity.CompanyRecruiter;
import tech.talenthium.authservice.entity.CompanyRole;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.exception.NotFoundException;
import tech.talenthium.authservice.repository.CompanyRecruiterRepository;
import tech.talenthium.authservice.repository.CompanyRepository;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final CompanyRecruiterRepository companyRecruiterRepository;

    public boolean existsById(Long id) {
        return companyRepository.existsById(id);
    }

    @Transactional
    public Company registerCompany(CompanyRegisterRequest request, User user) {

        //check is a recruiter already owns a company

        if(companyRecruiterRepository.existsCompanyRecruiterByRecruiterAndRole(user, CompanyRole.OWNER))
        {
            throw new IllegalStateException("A recruiter can only own one company");
        }

        Company company = Company.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .address(request.getAddress())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .build();

        Company savedCompany = companyRepository.save(company);

        CompanyRecruiter companyRecruiter = CompanyRecruiter.builder()
                .company(savedCompany)
                .recruiter(user)
                .role(CompanyRole.OWNER)
                .build();
        companyRecruiterRepository.save(companyRecruiter);
        return savedCompany;

    }

    public Page<CompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findAllCompany(pageable);
    }

    public CompanyResponse getCompanyById(Long id) {
        return companyRepository.findCompanyById(id);
    }
}
