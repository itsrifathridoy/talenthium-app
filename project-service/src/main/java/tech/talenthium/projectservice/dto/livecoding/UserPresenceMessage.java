package tech.talenthium.projectservice.dto.livecoding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPresenceMessage {
    private String userId;
    private String userName;
    private String userAvatar;
    private String type; // "join" or "leave"
    private long timestamp;
}
