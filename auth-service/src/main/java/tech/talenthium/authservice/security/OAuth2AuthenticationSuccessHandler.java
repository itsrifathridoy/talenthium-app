package tech.talenthium.authservice.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import tech.talenthium.authservice.dto.response.TokenPair;
import tech.talenthium.authservice.entity.RefreshToken;
import tech.talenthium.authservice.exception.UnauthorizeException;
import tech.talenthium.authservice.repository.RefreshTokenRepository;
import tech.talenthium.authservice.repository.UserRepository;
import tech.talenthium.authservice.service.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.oauth2.redirect-uri:http://localhost:3000}")
    private String redirectUri;

        @Value("${app.jwt.expiration}")
        private long accessExpirationMs;

        @Value("${app.jwt.refresh-expiration}")
        private long refreshExpirationMs;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        TokenPair tokenPair = jwtService.generateOAuthTokenPair(oAuth2User);
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenPair.getRefreshToken())
                .user(userRepository.findByEmail(oAuth2User.getAttribute("email"))
                        .orElseThrow(() -> new UnauthorizeException("User not found")))
                .expiresAt(jwtService.extractExpirationFromToken(tokenPair.getRefreshToken()))
                .build();
        ResponseCookie refresh_token = ResponseCookie.from("refresh_token", tokenPair.getRefreshToken())
                .httpOnly(true)
                .sameSite("None")
                .secure(true)
                .path("/")
                .maxAge(Math.toIntExact(refreshExpirationMs / 1000))
                .build();
        response.addHeader("Set-Cookie", refresh_token.toString());

        ResponseCookie access_token = ResponseCookie.from("access_token", tokenPair.getAccessToken())
                .httpOnly(true)
                .sameSite("None")
                .secure(true)
                .path("/")
                .maxAge(Math.toIntExact(accessExpirationMs / 1000))
                .build();
        response.addHeader("Set-Cookie", access_token.toString());
        response.sendRedirect(redirectUri);
        refreshTokenRepository.save(refreshToken);
    }
}
