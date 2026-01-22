package tech.talenthium.authservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import tech.talenthium.authservice.dto.response.TokenPair;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.exception.JwtExpiredException;
import tech.talenthium.authservice.exception.NotFoundException;
import tech.talenthium.authservice.repository.UserRepository;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    private final UserRepository userRepository;


    public TokenPair generateTokenPair(Authentication authentication) {
        String accessToken = generateAccessToken(authentication);
        String refreshToken = generateRefreshToken(authentication);

        return new TokenPair(accessToken, refreshToken);
    }

    // Generate access token
    public String generateAccessToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        String role = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);

        Map<String, String> claims = new HashMap<>();
        claims.put("username", userPrincipal.getUsername());
        claims.put("role", role);



        return generateToken(authentication, jwtExpirationMs, claims);
    }

    public TokenPair generateOAuthTokenPair(OAuth2User oAuth2User){
        User user = userRepository.findByEmail(oAuth2User.getAttribute("email"))
                .orElseThrow(() -> new NotFoundException("User not found"));
        String accessToken = generateOAuthAccessToken(user);
        String refreshToken = generateOAuthRefreshToken(user);
        return new TokenPair(accessToken, refreshToken);

    }
    public String generateOAuthAccessToken(User user) {
        // Get role
        String role = user.getRole().name(); // assuming your User entity has Role enum

        // Prepare claims
        Map<String, String> claims = new HashMap<>();
        claims.put("username", user.getUsername());
        claims.put("role", role);

        // Generate token
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .header()
                .add("typ", "JWT")
                .and()
                .subject(String.valueOf(user.getUserID()))
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSignInKey())
                .compact();
    }

    public String generateOAuthRefreshToken(User user) {

        // Get role
        String role = user.getRole().name(); // assuming your User entity has Role enum

        // Prepare claims
        Map<String, String> claims = new HashMap<>();
        claims.put("tokenType", "refresh");
        claims.put("username", user.getUsername());
        claims.put("role", role);

        // Generate token
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .header()
                .add("typ", "JWT")
                .and()
                .subject(String.valueOf(user.getUserID()))
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSignInKey())
                .compact();
    }


    // Generate refresh token
    public String generateRefreshToken(Authentication authentication) {

        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        String role = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);
        Map<String, String> claims = new HashMap<>();
        claims.put("tokenType", "refresh");
        claims.put("username", userPrincipal.getUsername());
        claims.put("role", role);
        return generateToken(authentication, refreshExpirationMs, claims);
    }

    private String generateToken(Authentication authentication, long expirationInMs, Map<String, String> claims) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        Date now = new Date(); // Time of token creation
        Date expiryDate = new Date(now.getTime() + expirationInMs); // Time of token expiration

        User user = userRepository.findByUsername(userPrincipal.getUsername()).orElseThrow();

        return Jwts.builder()
                .header()
                .add("typ", "JWT")
                .and()
                .subject(String.valueOf(user.getUserID()))
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSignInKey())
                .compact();
    }

    public Instant extractExpirationFromToken(String token) {
        Claims claims = extractAllClaims(token);
        if (claims != null) {
            return claims.getExpiration().toInstant();
        }
        return null;
    }

    // Validate token
    public boolean validateTokenForUser(String token, UserDetails userDetails) {
        final String username = extractUsernameFromToken(token);
        return username != null
                && username.equals(userDetails.getUsername());
    }

    public boolean isValidToken(String token) {
        return extractAllClaims(token) != null;
    }

    public String extractUsernameFromToken(String token) {
        Claims claims = extractAllClaims(token);

        if(claims != null) {
            return claims.get("username", String.class);
        }
        return null;
    }

    // Validate if the token is refresh token
    public boolean isRefreshToken(String token) {
        Claims claims = extractAllClaims(token);
        if(claims == null) {
            return false;
        }
        return "refresh".equals(claims.get("tokenType"));
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new JwtExpiredException("Expired or invalid JWT token");
        }
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
