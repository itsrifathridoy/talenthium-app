package tech.talenthium.authservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.talenthium.authservice.annotation.UniqueCompanyName;
import tech.talenthium.authservice.annotation.UniqueCompanyEmail;
import tech.talenthium.authservice.annotation.UniqueCompanyPhone;
import tech.talenthium.authservice.annotation.UniqueCompanyWebsite;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRegisterRequest {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    @UniqueCompanyName
    private String name;

    @NotBlank(message = "Company email is required")
    @Email(message = "Email must be valid")
    @Size(max = 320, message = "Email must be less than 320 characters")
    @UniqueCompanyEmail
    private String email;

    @NotBlank(message = "Company phone is required")
    @Size(min = 10, max = 15, message = "Phone number must be between 10 and 15 characters")
    @UniqueCompanyPhone
    private String phone;

    @NotBlank(message = "Company website is required")
    @Size(max = 255, message = "Website URL must be less than 255 characters")
    @UniqueCompanyWebsite
    private String website;

    @NotBlank(message = "Company address is required")
    @Size(max = 255, message = "Address must be less than 255 characters")
    private String address;



    @NotBlank(message = "Company logo URL is required")
    private String logoUrl;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;
}
