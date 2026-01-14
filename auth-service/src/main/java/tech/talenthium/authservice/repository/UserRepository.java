package tech.talenthium.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.talenthium.authservice.entity.Role;
import tech.talenthium.authservice.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByUserIDAndRole(long userID, Role role);


    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);

}
