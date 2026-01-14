package tech.talenthium.authservice.exception;

import org.springframework.http.HttpStatus;

public class JwtExpiredException extends GlobalException {
    public JwtExpiredException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
