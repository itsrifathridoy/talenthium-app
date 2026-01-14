package tech.talenthium.authservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"company", "refreshTokens"})
@EqualsAndHashCode(exclude = {"company", "refreshTokens"})
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long userID;

    @NotNull
    private String username;

    @NotNull
    private String name;

    @NotNull
    @Email
    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    private LocalDate dateOfBirth;

    @NotNull
    @CreatedDate
    private Instant registerDate;

    private String password;

    private String avatar;

    @Enumerated(EnumType.STRING)
    private Role role;

    @NotNull
    @ColumnDefault("true")
    private boolean isActive;

    // Many users (recruiters) can belong to one company; nullable for other roles
    @ManyToOne(fetch = FetchType.LAZY)
    private Company company;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RefreshToken> refreshTokens;

    @PrePersist
    public void prePersist() {
        if (registerDate == null) {
            registerDate = Instant.now();
        }
        if (!isActive) {
            isActive = true;
        }
    }
}
