package tech.talenthium.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.talenthium.authservice.entity.Role;

import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailsResponse {
    private long userID;
    private String username;
    private String name;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String avatar;
    private Role role;
    private boolean isActive;
}
