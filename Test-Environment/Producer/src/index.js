const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');  // UUID oluşturmak için
const faker = require('faker');  // Faker ile rastgele veriler üretmek için
const { logMessage } = require('./logger');  // Loglama için helper fonksiyon

// Kafka konfigürasyonu
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER || 'kafka-0.kafka-headless.kafka.svc.cluster.local:9092'],
});

const producer = kafka.producer();

// Payload oluşturma fonksiyonu
const createPayload = () => {
  return {
    eventId: uuidv4(),  // UUID V4
    eventType: faker.random.arrayElement(['user_signup', 'order_created', 'payment_received']),  // Event türü
    timestamp: new Date().toISOString(),  // ISO8601 zaman damgası
    payload: {
      randomValue: faker.random.number(),  // Rastgele bir sayı
      randomString: faker.random.word(),   // Rastgele bir kelime
    }
  };
};

// Producer'a mesaj gönderme
const sendMessage = async () => {
  const payload = createPayload();
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'event',  // Topic adını environment variable'dan alıyoruz
      messages: [{ value: JSON.stringify(payload) }],
    });
    logMessage(`Message sent: ${JSON.stringify(payload)}`);
  } catch (error) {
    logMessage(`Error sending message: ${error}`);
  }
};

// Bağlantı başlatma ve mesaj gönderme döngüsü
const run = async () => {
  try {
    await producer.connect();
    logMessage('Producer connected to Kafka');

    setInterval(async () => {
      await sendMessage();  // Her 3 saniyede bir mesaj gönder
    }, 3000);  // 3000 ms = 3 saniye
  } catch (error) {
    logMessage(`Failed to connect producer: ${error}`);
  }
};

run();
