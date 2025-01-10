const { MongoClient } = require('mongodb');

let db;

async function connectToMongo() {
  const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    db = client.db();
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

async function saveToMongo(event) {
  const collection = db.collection('events');
  await collection.insertOne(event);
  console.log("Event saved to MongoDB:", JSON.stringify(event, null, 2));
}

module.exports = { connectToMongo, saveToMongo };
