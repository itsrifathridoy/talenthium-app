package tech.talenthium.authservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import tech.talenthium.authservice.annotation.UniqueCompanyName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @NotNull
    @Column(unique = true, length = 100)
    private String name;

    @NotNull
    @Column(unique = true, length = 322)
    private String email;

    @NotNull
    @Column(unique = true,length = 20)
    private String phone;

    @NotNull
    @Column(unique = true, length = 100)
    private String website;

    @NotNull
    private String address;

    @NotNull
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    private Instant createdAt;

    // One company can have many recruiters with roles (mapped table)
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CompanyRecruiter> companyRecruiters;


    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
