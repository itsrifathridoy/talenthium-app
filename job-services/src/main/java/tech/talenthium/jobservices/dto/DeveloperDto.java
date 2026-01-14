package tech.talenthium.jobservices.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeveloperDto {
    private Long developerId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String role;        // ROLE_DEVELOPER, ROLE_RECRUITER, etc.
    private boolean isActive;
    private String dateOfBirth; // ISO string: "YYYY-MM-DD"
}
