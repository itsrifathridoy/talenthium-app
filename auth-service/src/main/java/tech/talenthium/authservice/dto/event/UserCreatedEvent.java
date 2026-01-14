package tech.talenthium.authservice.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import tech.talenthium.authservice.entity.Role;

import java.time.Instant;
@Getter
@AllArgsConstructor
@Builder
public class UserCreatedEvent {
    Long userId;
    String email;
    String username;
    String name;
    Role role;
    Instant createdAt;
}
