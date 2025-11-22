import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import liveFeedsRouter from './routes/liveFeedsRouter.js';
import userRouter from './routes/userRouter.js';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.json());
app.use(cookieParser()); 
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

// ------------ Routes ------------
app.use('/api/liveFeeds', liveFeedsRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.json({ message: 'ATM Surveillance System API' });
});

// ------------ Start Server ------------
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

export default app;