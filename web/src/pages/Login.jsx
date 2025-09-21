// src/pages/Login.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inboundError = location.state?.error;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Hand off the slow work to the Loading page (better UX)
    navigate("/loading", {
      replace: true,
      state: {
        mode: "signin",
        credentials: { email, password },
        next: "/dashboard",
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-2">Admin Sign In</h1>
        <p className="text-sm text-gray-500 mb-6">Email &amp; password only</p>

        {(err || inboundError) && (
          <div className="mb-4 text-sm text-red-600">
            {err || inboundError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="admin@company.com"
            />
          </label>

          <label className="block">
            <span className="text-sm">Password</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <div className="flex items-center justify-between">
            <button
              disabled={loading}
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
