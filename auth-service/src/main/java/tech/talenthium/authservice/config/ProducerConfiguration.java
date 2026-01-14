package tech.talenthium.authservice.config;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;
import tech.talenthium.authservice.constant.KafkaConstant;
// Using shared event DTOs from common-events module

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ProducerConfiguration
{
    @Bean
    public NewTopic createAccountEventTopic(){
        return new NewTopic(KafkaConstant.CREATE_ACCOUNT_EVENT,3,(short) 3);
    }
}
