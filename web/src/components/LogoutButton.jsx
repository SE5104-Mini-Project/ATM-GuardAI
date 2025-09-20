// src/components/LogoutButton.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signOut, onAuthStateChanged } from "../firebase";

/**
 * Props:
 * - label: string | null  -> text shown left to the button (e.g., "Admin")
 * - showIcon: boolean     -> show a small shield icon before the label
 * - showEmail: boolean    -> show user email (default false for admin)
 * - compact: boolean      -> small outline/icon style for logout button
 * - iconOnly: boolean     -> logout button with icon only (no text)
 * - className: string     -> wrapper classes
 */
export default function LogoutButton({
  label = "Admin",
  showIcon = true,
  showEmail = false,
  compact = true,
  iconOnly = true,
  className = "",
}) {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setEmail(u?.email || ""));
    return () => unsub();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  const wrapper = `flex items-center gap-3 ${className}`;

  // Compact, subtle, icon-only button to fit header chips
  const btnBase =
    "inline-flex items-center justify-center transition rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1";
  const btnCompact =
    "h-8 w-8 border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 focus:ring-red-400";
  const btnRegular =
    "px-3 py-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-400";
  const btnClass = `${btnBase} ${compact ? btnCompact : btnRegular}`;

  return (
    <div className={wrapper}>
      {(label || showIcon || (showEmail && email)) && (
        <div className="flex items-center gap-2">
          {showIcon && (
            <span
              className="grid place-items-center w-9 h-9 rounded-full bg-blue-600 text-white"
              aria-hidden="true"
              title="Admin"
            >
              {/* shield icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
                <path d="M9.5 12.5l1.8 1.8 3.2-3.3" />
              </svg>
            </span>
          )}
          {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
          {showEmail && email && (
            <span className="text-xs text-gray-500 truncate max-w-[160px]" title={email}>
              {email}
            </span>
          )}
        </div>
      )}

      <button
        onClick={handleLogout}
        className={btnClass}
        aria-label="Logout"
        title="Logout"
      >
        {/* logout icon; hide text when iconOnly */}
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        {!iconOnly && <span className="ml-2 text-sm font-medium">Logout</span>}
      </button>
    </div>
  );
}
