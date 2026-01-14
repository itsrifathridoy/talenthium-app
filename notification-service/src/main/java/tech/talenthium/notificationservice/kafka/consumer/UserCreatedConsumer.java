package tech.talenthium.notificationservice.kafka.consumer;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import tech.talenthium.notificationservice.model.UserCreatedEvent;
import tech.talenthium.notificationservice.service.EmailService;
import tech.talenthium.notificationservice.type.Role;

@Service
@Slf4j
@AllArgsConstructor
public class UserCreatedConsumer implements AbstractListener<UserCreatedEvent> {

    EmailService emailService;

    @KafkaListener(topics = "create-account-event", groupId = "notification", concurrency = "3")
    public void listen(ConsumerRecord<String, UserCreatedEvent> message) {
        log.info("Key: {} | Value: {}", message.key(), message.value());
        log.info("Partition: {} | Offset: {}", message.partition(), message.offset());
        Context context = new Context();
        context.setVariable("name", message.value().getName());
        context.setVariable("role", message.value().getRole().name());
        context.setVariable("verificationLink", "http://localhost:8080/verify?token=12345" ); // Example verification link
        try {
            emailService.sendVerificationMail(message.value().getEmail(),
                    "Account Verification",
                    "verification-mail",
                    context);
            log.info("Email sent successfully to {}", message.value().getEmail());
        } catch (Exception e) {
            log.error("Error sending email: {}", e.getMessage());
        }
    }
}
