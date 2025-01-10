const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER || 'kafka-0.kafka-headless.kafka.svc.cluster.local:9092'],
});

const producer = kafka.producer();

module.exports = producer;
