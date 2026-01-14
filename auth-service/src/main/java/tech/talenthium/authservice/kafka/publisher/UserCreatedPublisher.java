package tech.talenthium.authservice.kafka.publisher;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import tech.talenthium.authservice.constant.KafkaConstant;
import tech.talenthium.authservice.dto.event.UserCreatedEvent;

@Service
@Slf4j
@AllArgsConstructor
public class UserCreatedPublisher implements AbstractPublisher<UserCreatedEvent>{
    private KafkaTemplate<String, UserCreatedEvent> userKafkaTemplate;

    public void emitEvent(UserCreatedEvent event){
        userKafkaTemplate.send(KafkaConstant.CREATE_ACCOUNT_EVENT,generateTransactionKey(),event)
                .whenComplete(((sendResult, throwable) -> {
                    if(throwable!=null){
                        onFailure(throwable);
                    }else {
                        onSuccess(sendResult);
                    }
                }));
    }

    public void onSuccess(SendResult<String, UserCreatedEvent> sendResult) {
        log.info("Received new metadata. \n" +
                        "Topic: {}, Partition: {}, Offset: {}, Timestamp: {}",
                sendResult.getRecordMetadata().topic(),
                sendResult.getRecordMetadata().partition(),
                sendResult.getRecordMetadata().offset(),
                sendResult.getRecordMetadata().timestamp());
    }

    public void onFailure(Throwable throwable) {
        log.info("Error occurred while producing the message {}", throwable);
    }


}