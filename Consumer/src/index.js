const { runConsumer } = require('./consumer');

runConsumer().catch(console.error);

process.on('SIGINT', async () => {
  console.log("Closing Kafka consumer...");
  await consumer.disconnect();
  process.exit();
});
