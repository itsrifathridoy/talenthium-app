package tech.talenthium.authservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tech.talenthium.authservice.dto.request.CompanyRegisterRequest;
import tech.talenthium.authservice.dto.response.CompanyResponse;
import tech.talenthium.authservice.entity.Company;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.exception.NotFoundException;
import tech.talenthium.authservice.exception.UnauthorizeException;
import tech.talenthium.authservice.service.CompanyService;
import tech.talenthium.authservice.service.UserService;

@Slf4j
@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Company> registerCompany(@Valid @RequestBody CompanyRegisterRequest request, Authentication authentication) {
        User user = userService.findByUsername(authentication.getName()).orElseThrow(
                () -> new UnauthorizeException("User not found")
        );
        Company company = companyService.registerCompany(request,user);
        return ResponseEntity.ok(company);
    }

    @GetMapping
    public ResponseEntity<Page<CompanyResponse>> getAllCompanies(
            @PageableDefault(size = 20) Pageable pageable, HttpServletRequest request) {
        String username = request.getHeader("X-USERNAME");
        String userID = request.getHeader("X-USERID");

        log.info("Request to get all companies by user: {} {}", username,userID);
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        CompanyResponse companyResponse = companyService.getCompanyById(id);
        if (companyResponse == null) {
            throw new NotFoundException("Company not found.");
        }
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }
}
