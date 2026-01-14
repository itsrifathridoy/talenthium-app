package tech.talenthium.notificationservice.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import tech.talenthium.notificationservice.type.Role;

import java.io.Serializable;
import java.time.Instant;

public class UserCreatedEvent implements Serializable {
    Long userId;
    String email;
    String username;
    String name;
    Role role;
    Instant createdAt;


    public UserCreatedEvent(Long userId, String email, String username, String name, Role role, Instant createdAt) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.name = name;
        this.role = role;
        this.createdAt = createdAt;
    }

    public UserCreatedEvent() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "UserCreatedEvent{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", name='" + name + '\'' +
                ", role=" + role +
                ", createdAt=" + createdAt +
                '}';
    }
}
