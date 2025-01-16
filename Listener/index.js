const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

app.use(express.json());
app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        console.log(
          JSON.stringify({
            level: 'INFO',
            path: message.trim().split(' ')[1], 
            headers: JSON.stringify(this.headers), 
          })
        );
      },
    },
  })
);

const eventSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  payload: { type: Object, required: true },
});

const Event = mongoose.model('Event', eventSchema);

app.get('/api/events', async (req, res) => {
  try {
    const { eventType, eventId, startTime, endTime, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (eventId) {
      filter.eventId = eventId;
    }

    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) filter.timestamp.$gte = new Date(startTime);
      if (endTime) filter.timestamp.$lte = new Date(endTime);
    }

    const skip = (page - 1) * limit;
    const events = await Event.find(filter).skip(skip).limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(filter);

    res.json({
      data: events,
      total: totalEvents,
      page: parseInt(page),
      pages: Math.ceil(totalEvents / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`List App running on http://localhost:${PORT}`);
});
