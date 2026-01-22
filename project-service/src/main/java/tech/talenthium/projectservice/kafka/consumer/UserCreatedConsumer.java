package tech.talenthium.projectservice.kafka.consumer;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tech.talenthium.projectservice.dto.event.UserCreatedEvent;
import tech.talenthium.projectservice.service.UserService;

@Service
@Slf4j
@AllArgsConstructor
public class UserCreatedConsumer {

    private final UserService userService;

    @KafkaListener(topics = "create-account-event", groupId = "project-service", concurrency = "3")
    public void listen(ConsumerRecord<String, UserCreatedEvent> message) {
        log.info("Received UserCreatedEvent - Key: {} | Value: {}", message.key(), message.value());
        log.info("Partition: {} | Offset: {}", message.partition(), message.offset());

        try {
            UserCreatedEvent event = message.value();
            userService.createUserFromEvent(event);
            log.info("User {} successfully synced to project-service database", event.getUsername());
        } catch (Exception e) {
            log.error("Error processing UserCreatedEvent: {}", e.getMessage(), e);
        }
    }
}
