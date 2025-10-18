import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import Event from "../models/Event.js";
const r = Router();

r.post("/", auth, async (req,res)=>{
  const doc = await Event.create({ ...req.body, createdBy: req.user.uid });
  res.status(201).json(doc);
});

r.get("/", auth, async (req,res)=>{
  const q = {};
  if (["atm","camera","sensor"].includes(req.query.source)) q.source = req.query.source;
  if (["info","warn","critical"].includes(req.query.level)) q.level = req.query.level;
  const list = await Event.find(q).sort("-createdAt").limit(200);
  res.json(list);
});

r.delete("/:id", auth, async (req,res)=>{
  await Event.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default r;
