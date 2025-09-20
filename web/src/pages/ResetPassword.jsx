// src/pages/ResetPassword.jsx
import { useState } from "react";
import { sendPasswordResetEmail, auth } from "../firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function handleSend() {
    setMsg(""); setErr("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg("Password reset email sent (if the account exists).");
    } catch {
      setErr("Failed to send reset email. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
        {msg && <div className="mb-3 text-green-700 text-sm">{msg}</div>}
        {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}

        <label className="block mb-4">
          <span className="text-sm">Admin Email</span>
          <input
            className="mt-1 w-full rounded-md border p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
          />
        </label>
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send Reset Email
        </button>
      </div>
    </div>
  );
}
