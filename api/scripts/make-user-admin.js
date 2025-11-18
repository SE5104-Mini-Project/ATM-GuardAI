// scripts/make-user-admin.js
// Usage: node scripts/make-user-admin.js admin@bank.com
import admin from "firebase-admin";
import { connect } from "mongoose";
import User from "../src/models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
let credsObj = null;
if (process.env.FB_ADMIN_JSON) {
  try { credsObj = JSON.parse(process.env.FB_ADMIN_JSON); } 
  catch (e) { console.error("Failed to parse FB_ADMIN_JSON:", e.message); process.exit(1); }
} else if (process.env.FB_ADMIN_JSON_BASE64) {
  try {
    const raw = Buffer.from(process.env.FB_ADMIN_JSON_BASE64, "base64").toString("utf8");
    credsObj = JSON.parse(raw);
  } catch (e) { console.error("Failed to decode FB_ADMIN_JSON_BASE64:", e.message); process.exit(1); }
}

if (!credsObj) {
  console.error("❌ Firebase credentials not found in environment variables");
  console.error("Please set FB_ADMIN_JSON or FB_ADMIN_JSON_BASE64 in .env");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(credsObj) });
  console.log("✅ Firebase admin initialized");
}

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/atm-guard";
await connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const [, , email] = process.argv;
if (!email) {
  console.error("Usage: node scripts/make-user-admin.js <email>");
  process.exit(1);
}

try {
  // Find user in Firebase by email
  const fbUser = await admin.auth().getUserByEmail(email);
  console.log("Found Firebase user:", fbUser.uid, fbUser.email);

  // Update MongoDB user role to admin
  const user = await User.findOneAndUpdate(
    { uid: fbUser.uid },
    { role: "admin" },
    { new: true, upsert: true }
  );
  
  console.log("✅ Updated user to admin:", user.email, "role:", user.role);
  process.exit(0);
} catch (e) {
  console.error("❌ Error:", e.message);
  process.exit(1);
}
