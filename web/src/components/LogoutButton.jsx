import { useNavigate } from "react-router-dom";

export default function LogoutButton({
  label = "Admin",
  showIcon = true,
  showEmail = false,
  compact = true,
  iconOnly = true,
  className = "",
}) {
  const navigate = useNavigate();

  function handleLogout() {
    navigate("/login", { replace: true });
  }

  const wrapper = `flex items-center gap-3 ${className}`;

  const btnBase =
    "inline-flex items-center justify-center transition rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1";
  const btnCompact =
    "h-8 w-8 border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 focus:ring-red-400";
  const btnRegular =
    "px-3 py-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-400";
  const btnClass = `${btnBase} ${compact ? btnCompact : btnRegular}`;

  return (
    <div className={wrapper}>
      {(label || showIcon || showEmail) && (
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
          {showEmail && (
            <span className="text-xs text-gray-500 truncate max-w-[160px]">
              user@example.com
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