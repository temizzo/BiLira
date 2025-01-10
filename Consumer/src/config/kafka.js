const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'consumer-group' });

module.exports = { kafka, consumer };
