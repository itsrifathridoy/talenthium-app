package tech.talenthium.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import tech.talenthium.authservice.dto.event.UserCreatedEvent;
import tech.talenthium.authservice.entity.Role;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.kafka.publisher.UserCreatedPublisher;
import tech.talenthium.authservice.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserCreatedPublisher userCreatedPublisher;


    public boolean usernameExists(String username) { return userRepository.existsByUsername(username); }
    public boolean emailExists(String email) { return userRepository.existsByEmail(email); }
    public boolean phoneExists(String phone) { return userRepository.existsByPhone(phone); }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }
    public Optional<User> findByUserIDAndRole(long userID, Role role) {
        return userRepository.findByUserIDAndRole(userID, role);
    }

    public User registerOAuthUser(OAuth2User oAuth2User) {
        log.info("oauthUser: {}",oAuth2User);
        log.info("username:{}, name:{}, avatar: {}, email: {} ",oAuth2User.getName(),oAuth2User.getAttribute("name"),oAuth2User.getAttribute("picture"),oAuth2User.getAttribute("email"));
        String picture = (String) oAuth2User.getAttribute("picture");
        String avatarUrl = (picture != null && !picture.isBlank())
                ? picture
                : (String) oAuth2User.getAttribute("avatar_url");

        // Assign a strong random encoded password to avoid null/empty password issues
        String randomPassword = passwordEncoder.encode(UUID.randomUUID().toString());

        User user = User
                .builder()
                .username(oAuth2User.getName())
                .name(oAuth2User.getAttribute("name"))
                .avatar(avatarUrl)
                .email(oAuth2User.getAttribute("email"))
                .password(randomPassword)
                .role(Role.ROLE_NOT_ASSIGN)
                .build();

        User createdUser = userRepository.save(user);

        UserCreatedEvent userCreatedEvent = UserCreatedEvent.builder()
                .userId(createdUser.getUserID())
                .email(createdUser.getEmail())
                .username(createdUser.getUsername())
                .name(createdUser.getName())
                .role(createdUser.getRole())
                .createdAt(createdUser.getRegisterDate())
                .build();
        userCreatedPublisher.emitEvent(userCreatedEvent);

        return createdUser;

    }
}
