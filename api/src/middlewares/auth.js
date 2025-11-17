// api/src/middlewares/auth.js
import admin from "firebase-admin";
import createError from "http-errors";
import User from "../models/User.js";

export const initFirebase = () => {
  // Support either raw JSON in FB_ADMIN_JSON or base64-encoded in FB_ADMIN_JSON_BASE64
  let credsObj = null;
  if (process.env.FB_ADMIN_JSON) {
    try { credsObj = JSON.parse(process.env.FB_ADMIN_JSON); } 
    catch (e) { console.error("Failed to parse FB_ADMIN_JSON:", e.message); }
  } else if (process.env.FB_ADMIN_JSON_BASE64) {
    try {
      const raw = Buffer.from(process.env.FB_ADMIN_JSON_BASE64, "base64").toString("utf8");
      credsObj = JSON.parse(raw);
    } catch (e) { console.error("Failed to decode FB_ADMIN_JSON_BASE64:", e.message); }
  }

  if (!credsObj) {
    console.warn("Firebase admin credentials not provided via env. initFirebase may fail for auth-protected routes.");
    return;
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(credsObj) });
    console.log("Firebase admin initialized");
  }
};

export const auth = async (req, res, next) => {
  try {
    // If previous middleware already set req.user, skip
    if (req.user && req.user.uid) return next();

    const header = req.headers.authorization || "";
    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    // verify token
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded || !decoded.uid) return res.status(401).json({ error: "Invalid token" });

    // Find or create user profile in MongoDB by firebase uid
    let user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      // Auto-create profile if it doesn't exist
      user = await User.create({ 
        uid: decoded.uid, 
        email: decoded.email || decoded.firebase.identities?.email?.[0], 
        role: 'user' 
      });
      console.log(`✨ Auto-created user profile for ${decoded.email || decoded.uid}`);
    }

    // attach DB user to req.user
    req.user = user;
    next();
  } catch (e) {
    console.error("Auth error:", e?.message || e);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// admin guard
export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
};
