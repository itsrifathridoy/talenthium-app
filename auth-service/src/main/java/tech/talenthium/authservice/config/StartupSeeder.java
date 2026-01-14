package tech.talenthium.authservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import tech.talenthium.authservice.entity.Role;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.repository.UserRepository;

import java.time.LocalDate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class StartupSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    @Value("${app.admin.email:admin@talenthium.local}")
    private String adminEmail;

    @Value("${app.admin.phone:}")
    private String adminPhone;

    @Value("${app.admin.password:ChangeMe123!}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // Check by email first (unique constraint), then fallback to username.
        boolean exists = userRepository.existsByEmail(adminEmail) || userRepository.existsByUsername(adminUsername);
        if (exists) {
            log.info("Admin account seeding skipped: account already exists (email='{}' or username='{}').", adminEmail, adminUsername);
            return;
        }

        User admin = User.builder()
                .username(adminUsername)
                .name(adminName)
                .email(adminEmail)
                .phone(adminPhone == null || adminPhone.isBlank() ? null : adminPhone)
                .dateOfBirth((LocalDate) null)
                .password(passwordEncoder.encode(adminPassword))
                .avatar(null)
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .company(null)
                .build();

        userRepository.save(admin);
        log.info("Admin account created: username='{}', email='{}'", adminUsername, adminEmail);
    }
}

