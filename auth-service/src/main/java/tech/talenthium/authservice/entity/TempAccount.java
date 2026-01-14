package tech.talenthium.authservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RedisHash("temp_account")
public class TempAccount implements Serializable {

    @Id
    private String id; // Will be used as Redis key (can be email or verification token)

    private String username;
    private String name;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String password; // Should be already hashed
    private String verificationToken;
    private boolean isVerified;

    @TimeToLive
    private Long ttl = 3600L; // Default 1 hour in seconds

    // Additional fields for account verification process
    private int verificationAttempts;
    private String verificationCode;
    private long createdAt;
}
