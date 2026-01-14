package tech.talenthium.authservice.exception;

import org.springframework.http.HttpStatus;

public class AlreadyExistException extends GlobalException{
    public AlreadyExistException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
