package tech.talenthium.projectservice.dto.livecoding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPositionMessage {
    private String senderId;
    private String senderName;
    private String filename;
    private int line;
    private int column;
    private long timestamp;
}
