package tech.talenthium.authservice.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tech.talenthium.authservice.entity.TempAccount;

import java.util.Optional;

@Repository
public interface TempAccountRepository extends CrudRepository<TempAccount, String> {

    /**
     * Find temporary account by email
     * @param email the email address
     * @return Optional TempAccount
     */
    Optional<TempAccount> findByEmail(String email);

    /**
     * Find temporary account by username
     * @param username the username
     * @return Optional TempAccount
     */
    Optional<TempAccount> findByUsername(String username);

    /**
     * Find temporary account by verification token
     * @param verificationToken the verification token
     * @return Optional TempAccount
     */
    Optional<TempAccount> findByVerificationToken(String verificationToken);

    /**
     * Check if email exists in temporary accounts
     * @param email the email address
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Check if username exists in temporary accounts
     * @param username the username
     * @return true if exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Delete temporary account by email
     * @param email the email address
     */
    void deleteByEmail(String email);

    /**
     * Delete temporary account by verification token
     * @param verificationToken the verification token
     */
    void deleteByVerificationToken(String verificationToken);
}
