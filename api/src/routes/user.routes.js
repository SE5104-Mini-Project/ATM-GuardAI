// api/src/routes/user.routes.js
import { Router } from "express";
import admin from "firebase-admin";
import User from "../models/User.js";
import { auth } from "../middlewares/auth.js";
import createError from "http-errors";

const r = Router();

// All routes require authentication (Firebase token verified in auth middleware)
r.use(auth);

// GET /api/users/me
// Ensure MongoDB profile exists (upsert) and return it
r.get("/me", async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { uid: req.user.uid, email: req.user.email, role: req.user.role || "user" },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// admin-check helper (inline so we don't depend on other middleware)
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
};

// GET /api/users  (admin only) - list all users
r.get("/", requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// POST /api/users  (admin only) - create user in Firebase and MongoDB
// body: { name, email, password, role }
r.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name,email,password required" });

    // create Firebase user
    const fbUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      disabled: false
    });

    // create Mongo profile
    const user = await User.create({ uid: fbUser.uid, email, role });
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    // handle common Firebase error
    if (err.code === "auth/email-already-exists") return res.status(409).json({ error: "Email already exists" });
    next(err);
  }
});

// PUT /api/users/:id  (admin only) - update Mongo profile and Firebase account
// body may contain: { name, email, password, role, status }
r.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findById(id);
    if (!user) throw createError(404, "User not found");

    // Protect admin from demoting/deleting themselves (optional)
    if (req.user.uid === user.uid && updates.role && updates.role !== "admin") {
      return res.status(400).json({ error: "Cannot change your own admin role" });
    }

    // Prepare firebase updates
    const fbUpdates = {};
    if (updates.email && updates.email !== user.email) fbUpdates.email = updates.email;
    if (updates.name) fbUpdates.displayName = updates.name;
    if (updates.password) fbUpdates.password = updates.password;
    if (typeof updates.status === "string") fbUpdates.disabled = updates.status !== "Active";

    if (Object.keys(fbUpdates).length) {
      await admin.auth().updateUser(user.uid, fbUpdates);
    }

    // persist role/email in Mongo
    if (updates.role) user.role = updates.role;
    if (updates.email) user.email = updates.email;

    await user.save();
    res.json({ message: "User updated", user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id  (admin only) - delete firebase account + mongo record
r.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw createError(404, "User not found");

    // prevent deleting self
    if (req.user.uid === user.uid) return res.status(400).json({ error: "Cannot delete your own account" });

    await admin.auth().deleteUser(user.uid);
    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

export default r;

