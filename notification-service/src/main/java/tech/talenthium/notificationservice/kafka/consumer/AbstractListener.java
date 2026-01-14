package tech.talenthium.notificationservice.kafka.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import tech.talenthium.notificationservice.model.UserCreatedEvent;

public interface AbstractListener <T> {
    void listen(ConsumerRecord<String, T> message);
}
