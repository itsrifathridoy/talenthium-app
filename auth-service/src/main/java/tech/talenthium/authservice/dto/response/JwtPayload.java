package tech.talenthium.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import tech.talenthium.authservice.entity.Role;

@Data
@AllArgsConstructor
public class JwtPayload {
    private String username;
    private Role role;
}
