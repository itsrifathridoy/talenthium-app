package tech.talenthium.projectservice.dto.livecoding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeChangeMessage {
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private String filename;
    private String content;
    private long timestamp;
}
