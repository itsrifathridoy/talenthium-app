package tech.talenthium.jobservices.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import tech.talenthium.jobservices.annotation.RequireRole;
import tech.talenthium.jobservices.dto.ErrorResponse;

import java.util.Date;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if (handler instanceof HandlerMethod method) {
            RequireRole requireRole = method.getMethodAnnotation(RequireRole.class);

            if (requireRole != null) {
                String headerRole = request.getHeader("X-ROLE");
                String requiredRole = requireRole.value();
                if (headerRole == null || !headerRole.equals(requiredRole)) {
//                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                    response.getWriter().write("Forbidden: Invalid role");

                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");


                    new ObjectMapper().writeValue(response.getOutputStream(),
                            ErrorResponse.builder()
                                    .statusCode(HttpServletResponse.SC_UNAUTHORIZED)
                                    .message("Forbidden: You do not have the required role to access this resource.")
                                    .timestamp(new Date())
                                    .path(request.getRequestURI())
                                    .build()
                    );
                    return false;
                }
            }
        }

        return true; // continue if no annotation or role matches
    }
}
