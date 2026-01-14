package tech.talenthium.authservice.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tech.talenthium.authservice.dto.response.ErrorResponse;
import tech.talenthium.authservice.service.JwtService;

import java.io.IOException;
import java.util.Date;
import java.util.Objects;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal
            (HttpServletRequest request,
             HttpServletResponse response,
             FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();

        String jwt = null;
        String username;

        try {
            // 1) Prefer Authorization header if present
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            } else {
                // 2) Fallback to cookies
                // Accept access_token on all routes, and refresh_token only on /api/auth/refresh-token
                String accessCookie = getCookieValue(request, "access_token");
                String refreshCookie = getCookieValue(request, "refresh_token");

                if (accessCookie != null && !accessCookie.isBlank()) {
                    jwt = accessCookie;
                } else if (Objects.equals(requestPath, "/api/auth/refresh-token") && refreshCookie != null && !refreshCookie.isBlank()) {
                    jwt = refreshCookie;
                }
            }

            // If we still don't have a token, move on
            if (jwt == null || jwt.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            // check if the token is structurally valid
            if (!jwtService.isValidToken(jwt)) {
                filterChain.doFilter(request, response);
                return;
            }

            // If token is a refresh token but not called on refresh endpoint, ignore
            boolean isRefreshToken = jwtService.isRefreshToken(jwt);
            if (isRefreshToken && !Objects.equals(requestPath, "/api/auth/refresh-token")) {
                filterChain.doFilter(request, response);
                return;
            }

            username = jwtService.extractUsernameFromToken(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.validateTokenForUser(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            // Always continue the filter chain
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");

            new ObjectMapper().writeValue(response.getOutputStream(),
                    ErrorResponse.builder()
                            .statusCode(HttpServletResponse.SC_UNAUTHORIZED)
                            .message(e.getMessage())
                            .timestamp(new Date())
                            .path(request.getRequestURI())
                            .build()
            );
        }
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (cookie != null && name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}