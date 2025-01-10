const { connectToMongo, saveToMongo } = require('./config/mongodb');
const { consumer } = require('./config/kafka');
const { logMessage } = require('./utils/logger');

async function runConsumer() {
  try {
    await connectToMongo();
    await consumer.connect();
    console.log("Kafka consumer connected.");

    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });
    console.log(`Subscribed to Kafka topic: ${process.env.KAFKA_TOPIC}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        let event;
        try {
          event = JSON.parse(value);
          logMessage({ event });  // Log the event
          await saveToMongo(event);  // Save the event to MongoDB
        } catch (err) {
          console.error("Error processing message:", err);
        }
      },
    });
  } catch (err) {
    console.error("Error in consumer:", err);
  }
}

module.exports = { runConsumer };
