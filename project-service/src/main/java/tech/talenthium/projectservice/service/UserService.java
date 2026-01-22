package tech.talenthium.projectservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.talenthium.projectservice.dto.event.UserCreatedEvent;
import tech.talenthium.projectservice.entity.User;
import tech.talenthium.projectservice.repository.UserRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public User createUserFromEvent(UserCreatedEvent event) {
        log.info("Creating user from event: {} ({})", event.getUsername(), event.getEmail());

        // Check if user already exists
        if (userRepository.findByUserId(event.getUserId()).isPresent()) {
            log.warn("User {} already exists", event.getUserId());
            return userRepository.findByUserId(event.getUserId()).get();
        }

        User user = User.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .username(event.getUsername())
                .name(event.getName())
                .role(event.getRole())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {} (ID: {})", savedUser.getUsername(), savedUser.getUserId());
        return savedUser;
    }

    @Transactional
    public User updateGithubInfo(Long userId, String githubUsername, String githubId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setGithubUsername(githubUsername);
        return userRepository.save(user);
    }

    public User getUserById(Long userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    public boolean userExists(Long userId) {
        return userRepository.findByUserId(userId).isPresent();
    }

    public User getUserByGithubUsername(String githubUsername) {
        return userRepository.findByGithubUsername(githubUsername).orElse(null);
    }
}
