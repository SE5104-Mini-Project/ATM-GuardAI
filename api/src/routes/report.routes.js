import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import Report from "../models/Report.js";
const r = Router();

r.post("/", auth, async (req,res)=>{
  const doc = await Report.create({ ...req.body, uid: req.user.uid });
  res.status(201).json(doc);
});

r.get("/", auth, async (req,res)=>{
  const list = await Report.find({ uid: req.user.uid }).sort("-createdAt");
  res.json(list);
});

export default r;
