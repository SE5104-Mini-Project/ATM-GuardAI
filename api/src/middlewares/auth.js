// api/src/middlewares/auth.js
import admin from "firebase-admin";

export const initFirebase = () => {
  // Support either raw JSON in FB_ADMIN_JSON or base64-encoded in FB_ADMIN_JSON_BASE64
  let credsObj = null;
  if (process.env.FB_ADMIN_JSON) {
    try {
      credsObj = JSON.parse(process.env.FB_ADMIN_JSON);
    } catch (e) {
      console.error("Failed to parse FB_ADMIN_JSON:", e.message);
    }
  } else if (process.env.FB_ADMIN_JSON_BASE64) {
    try {
      const raw = Buffer.from(process.env.FB_ADMIN_JSON_BASE64, "base64").toString("utf8");
      credsObj = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to decode FB_ADMIN_JSON_BASE64:", e.message);
    }
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
    // If previous middleware (e.g., aiAuth) already set req.user, skip verification
    if (req.user && req.user.uid) {
      return next();
    }

    const header = req.headers.authorization || "";
    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, role: decoded.role || "user" };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
