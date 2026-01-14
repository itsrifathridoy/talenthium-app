package tech.talenthium.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tech.talenthium.authservice.entity.TempAccount;
import tech.talenthium.authservice.repository.TempAccountRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TempAccountService {

    private final TempAccountRepository tempAccountRepository;

    /**
     * Create a temporary account for email verification
     */
    public TempAccount createTempAccount(String username, String name, String email,
                                       String phone, LocalDate dateOfBirth, String hashedPassword) {

        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();

        // Create temp account
        TempAccount tempAccount = TempAccount.builder()
                .id(email) // Use email as Redis key
                .username(username)
                .name(name)
                .email(email)
                .phone(phone)
                .dateOfBirth(dateOfBirth)
                .password(hashedPassword)
                .verificationToken(verificationToken)
                .isVerified(false)
                .verificationAttempts(0)
                .createdAt(System.currentTimeMillis())
                .ttl(3600L) // 1 hour TTL
                .build();

        log.info("Creating temporary account for email: {}", email);
        return tempAccountRepository.save(tempAccount);
    }

    /**
     * Find temporary account by email
     */
    public Optional<TempAccount> findByEmail(String email) {
        return tempAccountRepository.findByEmail(email);
    }

    /**
     * Find temporary account by verification token
     */
    public Optional<TempAccount> findByVerificationToken(String token) {
        return tempAccountRepository.findByVerificationToken(token);
    }

    /**
     * Verify account and mark as verified
     */
    public boolean verifyAccount(String verificationToken, String verificationCode) {
        Optional<TempAccount> tempAccountOpt = tempAccountRepository.findByVerificationToken(verificationToken);

        if (tempAccountOpt.isEmpty()) {
            log.warn("Verification token not found: {}", verificationToken);
            return false;
        }

        TempAccount tempAccount = tempAccountOpt.get();

        // Check verification code (implement your verification logic here)
        if (verificationCode.equals(tempAccount.getVerificationCode())) {
            tempAccount.setVerified(true);
            tempAccountRepository.save(tempAccount);
            log.info("Account verified successfully for email: {}", tempAccount.getEmail());
            return true;
        } else {
            // Increment verification attempts
            tempAccount.setVerificationAttempts(tempAccount.getVerificationAttempts() + 1);
            tempAccountRepository.save(tempAccount);
            log.warn("Invalid verification code for email: {}", tempAccount.getEmail());
            return false;
        }
    }

    /**
     * Check if email exists in temporary accounts
     */
    public boolean existsByEmail(String email) {
        return tempAccountRepository.existsByEmail(email);
    }

    /**
     * Check if username exists in temporary accounts
     */
    public boolean existsByUsername(String username) {
        return tempAccountRepository.existsByUsername(username);
    }

    /**
     * Delete temporary account by email
     */
    public void deleteTempAccount(String email) {
        tempAccountRepository.deleteByEmail(email);
        log.info("Temporary account deleted for email: {}", email);
    }

    /**
     * Delete temporary account by verification token
     */
    public void deleteTempAccountByToken(String verificationToken) {
        tempAccountRepository.deleteByVerificationToken(verificationToken);
        log.info("Temporary account deleted for token: {}", verificationToken);
    }

    /**
     * Update TTL for temporary account
     */
    public void extendTempAccountTTL(String email, Long newTtl) {
        Optional<TempAccount> tempAccountOpt = tempAccountRepository.findByEmail(email);
        if (tempAccountOpt.isPresent()) {
            TempAccount tempAccount = tempAccountOpt.get();
            tempAccount.setTtl(newTtl);
            tempAccountRepository.save(tempAccount);
            log.info("TTL extended for temporary account: {}", email);
        }
    }
}
