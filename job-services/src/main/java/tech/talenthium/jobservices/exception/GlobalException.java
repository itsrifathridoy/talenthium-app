package tech.talenthium.jobservices.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
@Getter
public abstract class GlobalException extends RuntimeException {
    private final HttpStatus status;
    public GlobalException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

}
