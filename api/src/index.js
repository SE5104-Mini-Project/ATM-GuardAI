import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import liveFeedsRouter from './routes/liveFeedsRouter.js';

// ------------ MongoDB connection ------------
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.json());
app.use(express.static('public'));

// ------------ Routes ------------
app.use('/api/liveFeeds', liveFeedsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'ATM Surveillance System API' });
});

// ------------ Start Server ------------
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

export default app;