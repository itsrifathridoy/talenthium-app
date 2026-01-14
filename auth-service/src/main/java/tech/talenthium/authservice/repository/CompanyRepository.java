package tech.talenthium.authservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tech.talenthium.authservice.dto.response.CompanyResponse;
import tech.talenthium.authservice.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsById(Long id);
    boolean existsByName(String name);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByWebsite(String website);
    @Query(value = "SELECT new tech.talenthium.authservice.dto.response.CompanyResponse(" +
            "c.id, c.name, c.email, c.website, c.phone, c.address, c.description, c.logoUrl) " +
            "FROM Company c",
            countQuery = "SELECT COUNT(c) FROM Company c")
    Page<CompanyResponse> findAllCompany(Pageable pageable);


    @Query(value = "SELECT new tech.talenthium.authservice.dto.response.CompanyResponse(" +
            "c.id, c.name, c.email, c.website, c.phone, c.address, c.description, c.logoUrl) " +
            "FROM Company c WHERE c.id = :id",
            countQuery = "SELECT COUNT(c) FROM Company c WHERE c.id = :id")
    CompanyResponse findCompanyById(Long id);

}
