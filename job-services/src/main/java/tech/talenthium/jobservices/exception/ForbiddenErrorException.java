package tech.talenthium.jobservices.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenErrorException extends GlobalException {
    public ForbiddenErrorException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}