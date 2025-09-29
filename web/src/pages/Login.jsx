// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inboundError = location.state?.error;

  /* -------------- Handle Form Submit -------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Redirect to loading page where actual login logic can run
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
    /* -------------- Main Container -------------- */
    <div
      className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white"
      style={{
        backgroundImage: "url('/login_background_image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="main flex w-full min-h-screen items-center justify-center">
        <div className="flex-1"></div>

        {/* -------------- Login Card Container -------------- */}
        <div className="flex-1 flex items-center justify-center p-10 rounded-xl text-center text-white">
          <div className="w-full max-w-sm p-10 bg-[#101826] rounded-2xl shadow-xl">

            {/* -------------- Title -------------- */}
            <h1 className="text-3xl font-bold mb-1 text-center pb-2">Sign in</h1>
            <p className="text-xs text-teal-400 text-center mb-6 tracking-wide">
              SECURE DASHBOARD ACCESS
            </p>

            {/* -------------- Error Message -------------- */}
            {inboundError && (
              <div className="mb-4 text-sm text-red-500 text-center">
                {inboundError}
              </div>
            )}

            {/* -------------- Login Form -------------- */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
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

              {/* Password Input */}
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-md bg-[#1A2235] border border-gray-600 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* -------------- Options -------------- */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-teal-500" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-teal-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* -------------- Submit Button -------------- */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 transition font-semibold"
              >
                {loading ? "Redirecting…" : "Login to Dashboard"}
              </button>
            </form>

            {/* -------------- Footer Notes -------------- */}
            <p className="mt-6 text-[11px] text-gray-400 text-center">
              This system contains sensitive information. Ensure your credentials are
              protected at all times.
            </p>
            <p className="text-xs text-teal-400 text-center mt-2">
              ✓ Connection is encrypted
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}