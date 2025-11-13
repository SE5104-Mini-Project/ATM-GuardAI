import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import liveFeedsRouter from './routes/liveFeedsRouter.js';
import mongoose from 'mongoose';   // <-- added

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ATMguardAI:ATMguardAI1234@atmguardai.oexuwur.mongodb.net/?appName=ATMGuardAI";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));
// -------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/liveFeeds', liveFeedsRouter);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'Express server running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'ATM Surveillance System API' });
});

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
    console.log(`Make sure Flask API is running on http://localhost:5000`);
});

export default app;
