import admin from "firebase-admin";

export const initFirebase = () => {
  const creds = JSON.parse(process.env.FB_ADMIN_JSON);
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(creds) });
  }
};

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, role: decoded.role || "user" };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
