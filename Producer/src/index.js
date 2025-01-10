const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');  
const faker = require('faker');  

function logMessage(message) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), message }, null, 2));
}

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER || 'kafka-0.kafka-headless.kafka.svc.cluster.local:9092'],
});

const producer = kafka.producer();

const createPayload = () => {
  return {
    eventId: uuidv4(),  // UUID V4
    eventType: faker.random.arrayElement(['user_signup', 'order_created', 'payment_received']),  // Event türü
    timestamp: new Date().toISOString(),  
    payload: {
      randomValue: faker.random.number(),  
      randomString: faker.random.word(),   
    }
  };
};

const sendMessage = async () => {
  const payload = createPayload();
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'event', 
      messages: [{ value: JSON.stringify(payload) }],
    });
    logMessage(`Message sent: ${JSON.stringify(payload)}`);
  } catch (error) {
    logMessage(`Error sending message: ${error}`);
  }
};

const run = async () => {
  try {
    await producer.connect();
    logMessage('Producer connected to Kafka');

    setInterval(async () => {
      await sendMessage();  
    }, 3000);  
  } catch (error) {
    logMessage(`Failed to connect producer: ${error}`);
  }
};

run();
