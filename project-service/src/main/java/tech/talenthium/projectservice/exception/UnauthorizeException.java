package tech.talenthium.projectservice.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizeException extends GlobalException {
    public UnauthorizeException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
