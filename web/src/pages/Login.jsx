import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Loading from "./Loading";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyAuth } = useContext(AuthContext);

  const from = location.state?.from?.pathname || "/dashboard";

  /* -------------- Handle Form Submit -------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/users/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { user } = response.data.data;

        login(user);

        await verifyAuth();

        console.log("Login successful, user set in context:", user);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        setError(error.response.data.message || "Login failed.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-300 text-center">
                {error}
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
                  onChange={handleEmailChange}
                  placeholder="Enter Email"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-md bg-[#1A2235] border border-gray-600 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password Input with Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  disabled={loading}
                  minLength={6}
                  className="w-full rounded-md bg-[#1A2235] border border-gray-600 p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {/* Eye Icon Button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* -------------- Options -------------- */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-teal-500"
                    disabled={loading}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  disabled={loading}
                  className="text-teal-400 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forgot Password?
                </button>
              </div>

              {/* -------------- Submit Button -------------- */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full cursor-pointer py-3 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Login to Dashboard"
                )}
              </button>
            </form>

            {/* -------------- Demo Credentials Hint -------------- */}
            <div className="mt-6 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
              <p className="text-xs text-blue-300 text-center mb-2">
                💡 Demo Credentials
              </p>
              <p className="text-[10px] text-blue-400 text-center">
                Use any registered email/password from your database
              </p>
            </div>

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