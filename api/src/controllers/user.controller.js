// api/src/controllers/user.controller.js
import createError from "http-errors";
import admin from "firebase-admin";
import User from "../models/User.js";

// GET /api/users - list all users (admin only)
export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me - current logged-in user's profile
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) throw createError(401, "Not authenticated");
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users - create new user (admin only)
// body: { name, email, password, role, status }
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = "user", status = "Active" } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "name, email, password required" });

    // create Firebase user
    const fbUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
      disabled: status !== "Active"
    });

    // create Mongo profile
    const user = new User({
      uid: fbUser.uid,
      email,
      role,
    });
    await user.save();

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    // handle firebase error duplicate email
    if (err.code === "auth/email-already-exists") return res.status(409).json({ error: "Email already exists in Firebase" });
    next(err);
  }
};

// PUT /api/users/:id - update user (admin only)
// id = MongoDB _id
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g. { name, email, role, status, password }

    const user = await User.findById(id);
    if (!user) throw createError(404, "User not found");

    // Update Firebase account fields if present
    const firebaseUpdates = {};
    if (updates.email && updates.email !== user.email) firebaseUpdates.email = updates.email;
    if (updates.name) firebaseUpdates.displayName = updates.name;
    if (typeof updates.password === "string" && updates.password.length) firebaseUpdates.password = updates.password;
    if (typeof updates.status === "string") firebaseUpdates.disabled = updates.status !== "Active";

    if (Object.keys(firebaseUpdates).length) {
      await admin.auth().updateUser(user.uid, firebaseUpdates);
    }

    // update role in Mongo (only server-side controlled)
    if (updates.role) user.role = updates.role;
    if (updates.email) user.email = updates.email;

    await user.save();
    res.json({ message: "User updated", user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id - delete (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw createError(404, "User not found");

    // Prevent admin from deleting themselves
    if (req.user && req.user.uid === user.uid) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    await admin.auth().deleteUser(user.uid);
    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
