// api/src/routes/user.routes.js
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import User from "../models/User.js";
const r = Router();

r.get("/me", auth, async (req,res)=>{
  const user = await User.findOneAndUpdate(
    { uid: req.user.uid },
    { uid: req.user.uid, email: req.user.email, role: req.user.role },
    { new: true, upsert: true }
  );
  res.json(user);
});

export default r;
