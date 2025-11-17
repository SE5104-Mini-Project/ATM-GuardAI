// api/src/index.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import liveFeedsRouter from './routes/liveFeedsRouter.js';
import mongoose from 'mongoose';
import userRouter from './routes/user.routes.js';
import { initFirebase } from './middlewares/auth.js';

// -------------------------
// MongoDB connection
// -------------------------
const MONGO_URI = process.env.MONGO_URI ||
  "mongodb+srv://ATMguardAI:ATMguardAI1234@atmguardai.oexuwur.mongodb.net/?appName=ATMGuardAI";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------------
// Initialize Firebase Admin
// -------------------------
initFirebase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// Express App Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3001;

// -------------------------
// FIXED CORS CONFIG
// -------------------------
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Allow preflight explicitly
app.options("*", cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Debug: shows if OPTIONS is reaching backend
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// -------------------------
// Parsers & Static
// -------------------------
app.use(express.json());
app.use(express.static('public'));

// -------------------------
// Routes
// -------------------------
app.use('/api/liveFeeds', liveFeedsRouter);
app.use('/api/users', userRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Express server running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'ATM Surveillance System API' });
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`🟦 Allowed CORS Origin: ${FRONTEND_ORIGIN}`);
  console.log(`🔒 Ensure Flask API running on http://localhost:5000`);
});

export default app;
