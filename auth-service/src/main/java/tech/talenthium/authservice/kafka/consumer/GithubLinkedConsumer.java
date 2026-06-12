package tech.talenthium.authservice.kafka.consumer;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tech.talenthium.authservice.constant.KafkaConstant;
import tech.talenthium.authservice.dto.event.GithubLinkedEvent;
import tech.talenthium.authservice.service.UserService;

@Service
@Slf4j
@AllArgsConstructor
public class GithubLinkedConsumer {

    private final UserService userService;

    @KafkaListener(topics = KafkaConstant.GITHUB_LINKED_EVENT, groupId = "auth-service")
    public void listen(ConsumerRecord<String, GithubLinkedEvent> record) {
        GithubLinkedEvent event = record.value();
        log.info("Received GithubLinkedEvent for user {}: githubUsername={}", event.getUserId(), event.getGithubUsername());
        try {
            userService.updateGithubUsername(event.getUserId(), event.getGithubUsername());
        } catch (Exception e) {
            log.error("Failed to update githubUsername for user {}: {}", event.getUserId(), e.getMessage());
        }
    }
}
