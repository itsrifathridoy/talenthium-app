package tech.talenthium.authservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import tech.talenthium.authservice.entity.Role;

@Component("authz") // bean name referenced in SpEL
public class AuthzEvaluator {

    public boolean isRecruiter(Authentication authentication) {
        return hasAuthority(authentication, Role.ROLE_RECRUITER.name());
    }

    public boolean hasAuthority(Authentication authentication, String authority) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(authority));
    }

    public boolean hasAny(Authentication authentication, String... authorities) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        for (String req : authorities) {
            if (hasAuthority(authentication, req)) return true;
        }
        return false;
    }
}