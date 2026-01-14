import { Kafka } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_GROUP_ID, KAFKA_TOPICS } from '../config/kafka.config.js';
import userService from '../services/user.service.js';

class KafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'portfolio-service',
      brokers: KAFKA_BROKERS,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.consumer = this.kafka.consumer({ 
      groupId: KAFKA_GROUP_ID,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    this.isConnected = false;
  }

  async connect() {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log('✓ Kafka consumer connected successfully');
    } catch (error) {
      console.error('✗ Failed to connect Kafka consumer:', error);
      throw error;
    }
  }

  async subscribe() {
    try {
      await this.consumer.subscribe({ 
        topic: KAFKA_TOPICS.CREATE_ACCOUNT_EVENT, 
        fromBeginning: false 
      });
      console.log(`✓ Subscribed to topic: ${KAFKA_TOPICS.CREATE_ACCOUNT_EVENT}`);
    } catch (error) {
      console.error('✗ Failed to subscribe to topic:', error);
      throw error;
    }
  }

  async startConsuming() {
    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value.toString();
            const event = JSON.parse(value);

            console.log(`\n📨 Received message from ${topic}:`, {
              partition,
              offset: message.offset,
              timestamp: message.timestamp
            });

            // Handle different topics
            switch (topic) {
              case KAFKA_TOPICS.CREATE_ACCOUNT_EVENT:
                await this.handleUserCreatedEvent(event);
                break;
              default:
                console.log(`Unknown topic: ${topic}`);
            }
          } catch (error) {
            console.error('Error processing message:', error);
            // Don't throw error to prevent consumer from stopping
          }
        }
      });

      console.log('✓ Kafka consumer is running and listening for messages...\n');
    } catch (error) {
      console.error('✗ Error in consumer run:', error);
      throw error;
    }
  }

  async handleUserCreatedEvent(event) {
    try {
      console.log('Processing UserCreatedEvent:', event);
      
      await userService.handleUserCreatedEvent(event);
      
      console.log('✓ UserCreatedEvent processed successfully\n');
    } catch (error) {
      console.error('✗ Failed to handle UserCreatedEvent:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('✓ Kafka consumer disconnected');
    } catch (error) {
      console.error('✗ Error disconnecting Kafka consumer:', error);
    }
  }

  async start() {
    try {
      await this.connect();
      await this.subscribe();
      await this.startConsuming();
    } catch (error) {
      console.error('✗ Failed to start Kafka consumer:', error);
      throw error;
    }
  }
}

export default new KafkaConsumer();
