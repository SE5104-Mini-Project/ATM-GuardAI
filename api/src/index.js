import 'dotenv/config';
import express from 'express';
import path from 'path';
import liveFeedsRouter from './routes/liveFeedsRouter.js';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

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