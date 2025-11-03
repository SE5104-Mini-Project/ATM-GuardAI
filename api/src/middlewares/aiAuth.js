// api/src/middlewares/aiAuth.js
export function aiAuth(req, res, next) {
  // If a previous middleware already set req.user, allow
  if (req.user && req.user.uid) return next();

  const header = req.headers.authorization || "";
  const token = header.split(" ")[1];
  if (!token) return next(); // let auth() later handle missing token

  // If matches worker token (env)
  if (process.env.AI_WORKER_TOKEN && token === process.env.AI_WORKER_TOKEN) {
    // mark as system user for auditing
    req.user = { uid: "ai_service_worker", email: null, role: "system" };
    return next();
  }

  // otherwise continue: auth middleware will verify Firebase tokens
  return next();
}
