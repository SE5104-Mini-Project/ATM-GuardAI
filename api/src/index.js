import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import createError from "http-errors";
import { initFirebase } from "./middlewares/auth.js";
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";
import reportRouter from "./routes/report.routes.js";

dotenv.config();
initFirebase();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Health check route
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/users", userRouter);
app.use("/events", eventRouter);
app.use("/reports", reportRouter);

// Error handling
app.use((_req, _res, next) => next(createError(404, "Not found")));
app.use((err, _req, res, _next) =>
  res.status(err.status || 500).json({ error: err.message })
);

// MongoDB event listeners
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (e) => console.error("❌ MongoDB error:", e.message));

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection established");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

startServer();
