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
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/users", userRouter);
app.use("/events", eventRouter);
app.use("/reports", reportRouter);

app.use((_req, _res, next) => next(createError(404, "Not found")));
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message }));

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 8080, () => console.log("API running on", process.env.PORT));

// in src/index.js, after mongoose.connect(...)
mongoose.connection.on("connected", ()=>console.log("MongoDB connected"));
mongoose.connection.on("error", (e)=>console.error("MongoDB error:", e.message));
