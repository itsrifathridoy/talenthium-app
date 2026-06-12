package tech.talenthium.projectservice.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import tech.talenthium.projectservice.dto.livecoding.CodeChangeMessage;
import tech.talenthium.projectservice.dto.livecoding.CursorPositionMessage;
import tech.talenthium.projectservice.dto.livecoding.UserPresenceMessage;

@Controller
public class LiveCodingController {

    @MessageMapping("/live/{projectId}/code")
    @SendTo("/topic/live/{projectId}/code")
    public CodeChangeMessage broadcastCode(
            @DestinationVariable String projectId,
            CodeChangeMessage message
    ) {
        return message;
    }

    @MessageMapping("/live/{projectId}/presence")
    @SendTo("/topic/live/{projectId}/presence")
    public UserPresenceMessage broadcastPresence(
            @DestinationVariable String projectId,
            UserPresenceMessage message
    ) {
        return message;
    }

    @MessageMapping("/live/{projectId}/cursor")
    @SendTo("/topic/live/{projectId}/cursor")
    public CursorPositionMessage broadcastCursor(
            @DestinationVariable String projectId,
            CursorPositionMessage message
    ) {
        return message;
    }
}
