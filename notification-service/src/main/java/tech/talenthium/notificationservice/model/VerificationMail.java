package tech.talenthium.notificationservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import tech.talenthium.notificationservice.type.Role;

@Data
@AllArgsConstructor
@Builder
public class VerificationMail {
    String to;
    String subject;
    String name;
    Role role;
    String verificationLink;
}
