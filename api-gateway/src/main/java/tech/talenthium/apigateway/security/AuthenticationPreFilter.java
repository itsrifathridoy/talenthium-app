package tech.talenthium.apigateway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tech.talenthium.apigateway.dto.response.ErrorResponse;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class AuthenticationPreFilter extends AbstractGatewayFilterFactory<AuthenticationPreFilter.Config> {

    public AuthenticationPreFilter() {
        super(Config.class);
    }


    @Autowired
    @Qualifier("excludedUrls")
    private List<String> excludedUrls;

    private final AntPathMatcher antPathMatcher = new AntPathMatcher();

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // No specific per-route configuration needed currently, but a Config class with
    // a no-args constructor is required so the framework can instantiate it.
    public static class Config {
        public Config() {}
    }
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange,chain)->{
            try{
                log.info("Authentication filter called");
                ServerHttpRequest request = exchange.getRequest();
                String path = request.getURI().getPath();
                HttpHeaders headers = request.getHeaders();
                String authHeader = headers.getFirst("Authorization");
                log.info("Path received {}",path);
                
                // Allow OPTIONS requests (CORS preflight) to pass through
                if("OPTIONS".equalsIgnoreCase(request.getMethod().name())){
                    log.info("OPTIONS request - allowing CORS preflight");
                    return chain.filter(exchange);
                }
                
                if(isExcludePath(path)){
                    return chain.filter(exchange);
                }

                // Determine token: prefer Authorization header, then cookies
                String token = null;
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                } else {
                    HttpCookie accessCookie = request.getCookies().getFirst("access_token");
                    HttpCookie refreshCookie = request.getCookies().getFirst("refresh_token");

                    if (accessCookie != null && !accessCookie.getValue().isBlank()) {
                        token = accessCookie.getValue();
                    } else {
                        // Accept refresh_token from cookies only on refresh token endpoint
                        boolean isRefreshEndpoint = path.endsWith("/api/auth/refresh-token") || path.contains("/api/auth/refresh-token");
                        if (isRefreshEndpoint && refreshCookie != null && !refreshCookie.getValue().isBlank()) {
                            token = refreshCookie.getValue();
                        }
                    }
                }

                if(token == null || token.isBlank()){
                    log.info("Missing token in Authorization header or cookies");
                    return handleAuthError(exchange,"Missing token in Authorization header or cookies", HttpStatus.UNAUTHORIZED);
                }

                log.info("Token resolved from {}", (authHeader != null && authHeader.startsWith("Bearer ")) ? "Authorization header" : "cookies");

                Claims claims = Jwts.parser()
                        .verifyWith(getSignInKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Disallow refresh tokens on non-refresh endpoints
                boolean isRefreshEndpoint = path.endsWith("/api/auth/refresh-token") || path.contains("/api/auth/refresh-token");
                String tokenType = claims.get("tokenType", String.class);
                if ("refresh".equals(tokenType) && !isRefreshEndpoint) {
                    log.info("Refresh token used outside refresh endpoint");
                    return handleAuthError(exchange, "Refresh token is only accepted on /api/auth/refresh-token", HttpStatus.UNAUTHORIZED);
                }

                String userID = claims.getSubject();
                String role = claims.get("role").toString().split("_")[1];
                String username = claims.get("username").toString();

                log.info("User {} logged in",username);
                log.info("User {} has role {}",username,role);
                log.info("User {} has id {}",username,userID);

                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-USERID", userID)
                        .header("X-USERNAME", username)
                        .header("X-ROLE", role)
                        .build();

                ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(mutatedRequest)
                        .build();
                return chain.filter(mutatedExchange);
            }catch (Exception e){
                return handleAuthError(exchange, e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isExcludePath(String path){
        if(excludedUrls == null || excludedUrls.isEmpty()){
            return false;
        }
        return excludedUrls.stream().anyMatch(pattern -> antPathMatcher.match(pattern.trim(), path));
    }


    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    private Mono<Void> handleAuthError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse errorResponse = new ErrorResponse(
                status.value(),
                message,
                new Date(),
                null,
                exchange.getRequest().getURI().getPath()
        );

        try{
            byte[] body = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(body);
            return response.writeWith(Mono.just(buffer));
        }catch (Exception e){
            throw new RuntimeException(e);
        }

    }
}