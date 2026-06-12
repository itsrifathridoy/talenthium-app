package tech.talenthium.projectservice.kafka.publisher;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import tech.talenthium.projectservice.dto.event.GithubLinkedEvent;
import tech.talenthium.projectservice.type.KafkaConstant;

@Service
@Slf4j
@AllArgsConstructor
public class GithubLinkedPublisher implements AbstractPublisher<GithubLinkedEvent> {

    private final KafkaTemplate<String, GithubLinkedEvent> kafkaTemplate;

    @Override
    public void emitEvent(GithubLinkedEvent event) {
        kafkaTemplate.send(KafkaConstant.GITHUB_LINKED_EVENT, generateTransactionKey(), event)
                .whenComplete((sendResult, throwable) -> {
                    if (throwable != null) {
                        onFailure(throwable);
                    } else {
                        onSuccess(sendResult);
                    }
                });
    }

    @Override
    public void onSuccess(SendResult<String, GithubLinkedEvent> sendResult) {
        log.info("GithubLinkedEvent sent - Topic: {}, Partition: {}, Offset: {}",
                sendResult.getRecordMetadata().topic(),
                sendResult.getRecordMetadata().partition(),
                sendResult.getRecordMetadata().offset());
    }

    @Override
    public void onFailure(Throwable throwable) {
        log.error("Failed to send GithubLinkedEvent: {}", throwable.getMessage());
    }
}
