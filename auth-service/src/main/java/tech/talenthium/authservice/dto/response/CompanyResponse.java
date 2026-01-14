package tech.talenthium.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String email;
    private String website;
    private String phone;
    private String address;
    private String description;
    private String logoUrl;
}
