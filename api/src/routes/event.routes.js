// api/src/routes/event.routes.js
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { aiAuth } from "../middlewares/aiAuth.js";
import Event from "../models/Event.js";
// import { runInference } from "../utils/ai.js"; // optional

const r = Router();

const SOURCE = ["atm", "camera", "sensor"];
const LEVEL  = ["info", "warn", "critical"];

/** Create event */
r.post("/", aiAuth, auth, async (req, res) => {
  try {
    const { source, level = "info", tags = [], data = {} } = req.body || {};

    if (!SOURCE.includes(source)) {
      return res.status(400).json({ error: `source must be one of ${SOURCE.join(", ")}` });
    }
    if (!LEVEL.includes(level)) {
      return res.status(400).json({ error: `level must be one of ${LEVEL.join(", ")}` });
    }

    const doc = await Event.create({
      source,
      level,
      tags: Array.isArray(tags) ? tags : [String(tags)],
      data,
      createdBy: req.user?.uid || null,
    });

    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/** List events (filters + pagination) */
r.get("/", aiAuth, auth, async (req, res) => {
  try {
    const q = {};
    const { source, level, tag, from, to } = req.query;

    if (SOURCE.includes(source)) q.source = source;
    if (LEVEL.includes(level)) q.level = level;
    if (tag) q.tags = { $in: Array.isArray(tag) ? tag : [tag] };

    // date range filters (createdAt)
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    // pagination
    const page  = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "50", 10), 1), 200);
    const skip  = (page - 1) * limit;

    // sort (default newest first)
    const sort = req.query.sort === "asc" ? "createdAt" : "-createdAt";

    const [items, total] = await Promise.all([
      Event.find(q).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(q),
    ]);

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/** Get single event by id */
r.get("/:id", aiAuth, auth, async (req, res) => {
  try {
    const doc = await Event.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(doc);
  } catch (e) {
    return res.status(400).json({ error: "Invalid id" });
  }
});

/** Delete event (optionally restrict to admin) */
r.delete("/:id",
  aiAuth,
  auth,
  async (req, res) => {
    try {
      const deleted = await Event.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      return res.sendStatus(204);
    } catch (e) {
      return res.status(400).json({ error: "Invalid id" });
    }
  }
);

/** (Optional) Call your AI service then store result */
// r.post("/infer-and-store", aiAuth, auth, async (req, res) => { ... });

export default r;
