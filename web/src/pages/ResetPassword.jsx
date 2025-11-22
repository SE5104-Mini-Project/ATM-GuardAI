// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSend() {
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      // Mock password reset - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMsg("Password reset email sent (if the account exists).");
    } catch {
      setErr("Failed to send reset email. Try again.");
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white"
      style={{
        backgroundImage: "url('/login_background_image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex w-full min-h-screen items-center justify-center">
        <div className="flex-1"></div>

        <div className="flex-1 flex items-center justify-center p-10 rounded-xl text-center">
          <div className="w-full max-w-sm p-10 bg-[#101826] rounded-2xl shadow-xl">
            
            {/* Title */}
            <h1 className="text-3xl font-bold mb-1 text-center pb-2">Reset Password</h1>
            <p className="text-xs text-teal-400 text-center mb-6 tracking-wide">
              SECURE DASHBOARD ACCESS
            </p>

            {/* Success & Error Messages */}
            {msg && <div className="mb-4 text-sm text-green-500 text-center">{msg}</div>}
            {err && <div className="mb-4 text-sm text-red-500 text-center">{err}</div>}

            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                autoComplete="username"
                className="w-full rounded-md bg-[#1A2235] border border-gray-600 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full cursor-pointer py-3 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 transition font-semibold"
            >
              {loading ? "Sending…" : "Send Reset Email"}
            </button>

            {/* Footer */}
            <p className="mt-6 text-[11px] text-gray-400 text-center">
              This system contains sensitive information. Ensure your credentials are protected.
            </p>
            <p className="text-xs text-teal-400 text-center mt-2">
              ✓ Connection is encrypted
            </p>

            {/* Back to Login */}
            <button
              onClick={() => navigate("/login")}
              className="mt-4 text-sm text-teal-400 hover:underline cursor-pointer"
            >
              ← Back to Login
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}