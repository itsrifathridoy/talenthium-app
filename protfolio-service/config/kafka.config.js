const kafkaBrokers = process.env.KAFKA_BROKERS || 'localhost:19092,localhost:19094,localhost:19096,localhost:19098,localhost:19100';

export const KAFKA_BROKERS = kafkaBrokers.split(',');
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'portfolio-service-group';

export const KAFKA_TOPICS = {
  CREATE_ACCOUNT_EVENT: 'create-account-event'
};
