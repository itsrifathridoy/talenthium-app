package tech.talenthium.authservice.kafka.publisher;

import org.springframework.kafka.support.SendResult;
import tech.talenthium.authservice.dto.event.UserCreatedEvent;

import java.util.UUID;

public interface AbstractPublisher <T> {
    void emitEvent(T event);
    void onSuccess(SendResult<String, T> sendResult);
    void onFailure(Throwable throwable);
    default String generateTransactionKey(){
        return UUID.randomUUID().toString();
    }
}
