package tech.talenthium.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.authservice.entity.CompanyRecruiter;
import tech.talenthium.authservice.entity.CompanyRole;
import tech.talenthium.authservice.entity.User;

public interface CompanyRecruiterRepository extends JpaRepository<CompanyRecruiter, Long> {
    boolean existsById(Long id);

    boolean existsCompanyRecruiterByRecruiterAndRole(User recruiter, CompanyRole role);

}
