// scripts/create-admin-user.js (ESM)
// Usage: node scripts/create-admin-user.js admin@bank.com "StrongPa$$w0rd"
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON safely
const keyPath = path.resolve(process.cwd(), "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/create-admin-user.js <email> <password>");
  process.exit(1);
}

try {
  const user = await admin.auth().createUser({
    email,
    password,
    emailVerified: true,
    disabled: false,
  });
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log("✅ Created admin:", email, "uid:", user.uid);
} catch (e) {
  console.error("❌ Error:", e);
  process.exit(1);
}
