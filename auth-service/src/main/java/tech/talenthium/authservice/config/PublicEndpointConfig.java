package tech.talenthium.authservice.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicEndpointConfig {

    List<String> publicEndpoints = List.of( "/api/auth/login", "/api/auth/refresh", "/api/auth/register/recruiter",
                                            "/api/auth/register/developer", "/api/company","/api/company/{id}");
    @GetMapping
    public List<String> getPublicEndpoints() {
        return publicEndpoints;
    }

}
