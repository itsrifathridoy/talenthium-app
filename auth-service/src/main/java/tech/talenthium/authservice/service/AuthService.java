package tech.talenthium.authservice.service;


import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tech.talenthium.authservice.dto.event.UserCreatedEvent;
import tech.talenthium.authservice.dto.request.DeveloperRegisterRequest;
import tech.talenthium.authservice.dto.request.LoginRequest;
import tech.talenthium.authservice.dto.request.RecruiterRegisterRequest;
import tech.talenthium.authservice.dto.response.TokenPair;
import tech.talenthium.authservice.entity.RefreshToken;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.exception.UnauthorizeException;
import tech.talenthium.authservice.kafka.publisher.UserCreatedPublisher;
import tech.talenthium.authservice.repository.RefreshTokenRepository;
import tech.talenthium.authservice.repository.UserRepository;

@Service
@AllArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final CustomUserDetailsService customUserDetailsService;
    private final UserCreatedPublisher userCreatedPublisher;

    @Transactional
    public void registerRecruiter(RecruiterRegisterRequest recruiterRegisterRequest) {

        // Create new user
        User user = User
                .builder()
                .username(recruiterRegisterRequest.getUsername())
                .name(recruiterRegisterRequest.getName())
                .email(recruiterRegisterRequest.getEmail())
                .phone(recruiterRegisterRequest.getPhone())
                .dateOfBirth(recruiterRegisterRequest.getDateOfBirth())
                .password(passwordEncoder.encode(recruiterRegisterRequest.getPassword()))
                .role(recruiterRegisterRequest.getRole())
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
    }

    @Transactional
    public void registerDeveloper(DeveloperRegisterRequest developerRegisterRequest) {
        // Create new user
        User user = User
                .builder()
                .username(developerRegisterRequest.getUsername())
                .name(developerRegisterRequest.getName())
                .email(developerRegisterRequest.getEmail())
                .phone(developerRegisterRequest.getPhone())
                .dateOfBirth(developerRegisterRequest.getDateOfBirth())
                .password(passwordEncoder.encode(developerRegisterRequest.getPassword()))
                .role(developerRegisterRequest.getRole())
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
    }

    public TokenPair login(LoginRequest loginRequest) {
        //username is email then find user by email
        if (loginRequest.getUsername() != null && loginRequest.getUsername().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            User userByEmail = userRepository.findByEmail(loginRequest.getUsername())
                    .orElseThrow(() -> new UnauthorizeException("Invalid username or password"));
            loginRequest.setUsername(userByEmail.getUsername());
        }
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Set authentication in security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate Token Pair
        TokenPair tokenPair = jwtService.generateTokenPair(authentication);
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenPair.getRefreshToken())
                .user(userRepository.findByUsername(loginRequest.getUsername())
                        .orElseThrow(() -> new UnauthorizeException("User not found")))
                .expiresAt(jwtService.extractExpirationFromToken(tokenPair.getRefreshToken()))
                .build();
        refreshTokenRepository.save(refreshToken);
        return tokenPair;
    }

    public TokenPair refreshToken(String refreshTokenCookie) {

        // check if it is valid refresh token
        if(!jwtService.isRefreshToken(refreshTokenCookie)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String user = jwtService.extractUsernameFromToken(refreshTokenCookie);
        log.info("Refreshing token for user: {}", userDetailsService.loadUserByUsername(user));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user);
        if (userDetails == null) {
            throw new UnauthorizeException("User not found");
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        String accessToken = jwtService.generateAccessToken(authentication);
        return new TokenPair(accessToken, refreshTokenCookie);
    }
}
