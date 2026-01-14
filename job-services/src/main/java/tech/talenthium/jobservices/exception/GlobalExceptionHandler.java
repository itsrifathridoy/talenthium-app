package tech.talenthium.jobservices.exception;

import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import tech.talenthium.jobservices.dto.ErrorResponse;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(
            MethodArgumentNotValidException exception,
            WebRequest request
    ) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
            errors.put(fieldName, errorMessage);
        });

        return new ResponseEntity<>(ErrorResponse.builder()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .message("Validation failed")
                .errors(errors)
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotSupportedExceptions(
            HttpRequestMethodNotSupportedException exception,
            WebRequest request
    ) {

        return new ResponseEntity<>(ErrorResponse.builder()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .message("Method not supported")
                .errors(exception.getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build(), HttpStatus.BAD_REQUEST);

    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<?> handleMissingParameterExceptions(
            MissingServletRequestParameterException exception,
            WebRequest request
    ) {

        return new ResponseEntity<>(ErrorResponse.builder()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .message("Missing request parameter")
                .errors(exception.getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build(), HttpStatus.BAD_REQUEST);

    }

    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<?> handlePropertyReferenceExceptions(
            PropertyReferenceException exception,
            WebRequest request
    ) {

        return new ResponseEntity<>(ErrorResponse.builder()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .message("Invalid property reference")
                .errors(exception.getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build(), HttpStatus.BAD_REQUEST);

    }



    @ExceptionHandler(GlobalException.class)
    public ResponseEntity<?> handleGlobalException(GlobalException ex,WebRequest request) {
        return new ResponseEntity<>(
                ErrorResponse.builder()
                        .statusCode(ex.getStatus().value())
                        .message(ex.getMessage())
                        .timestamp(new Date())
                        .path(request.getDescription(false).replace("uri=", ""))
                        .build()
                ,
                ex.getStatus()
        );
    }




    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleUnknownException(Exception exception, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", new Date());
        body.put("message", "An unexpected error occurred");
        body.put("details", exception.getMessage());

        return new ResponseEntity<>(
                ErrorResponse.builder()
                        .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(exception.getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                        .build()
                , HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


