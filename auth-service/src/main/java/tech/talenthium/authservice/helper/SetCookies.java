package tech.talenthium.authservice.helper;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import tech.talenthium.authservice.dto.response.TokenPair;

public class SetCookies {
    @Value("${app.jwt.expiration}")
    private static long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration}")
    private static long refreshExpirationMs;
    public static void setAccessAndRefreshToken(TokenPair tokenPair, HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", tokenPair.getAccessToken())
                .httpOnly(true)
                .sameSite("None")
                .secure(true)
                .path("/")
                .maxAge(jwtExpirationMs/1000)
                .build();
        response.addHeader("Set-Cookie", accessCookie.toString());
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokenPair.getRefreshToken())
                .httpOnly(true)
                .sameSite("None")
                .secure(true)
                .path("/")
                .maxAge(refreshExpirationMs/1000)
                .build();
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }
}
