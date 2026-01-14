package tech.talenthium.authservice.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tech.talenthium.authservice.dto.response.ErrorResponse;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");


        new ObjectMapper().writeValue(response.getOutputStream(),
                ErrorResponse.builder()
                        .statusCode(HttpServletResponse.SC_FORBIDDEN)
                        .message(accessDeniedException.getMessage())
                        .timestamp(new Date())
                        .path(request.getRequestURI())
                    .build()
                );
    }
}
