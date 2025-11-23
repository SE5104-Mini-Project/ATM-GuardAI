import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const cardBase = "rounded-2xl bg-white shadow-lg transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-xl";

const btnClass = "inline-flex items-center justify-center transition rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 h-8 w-8 border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 focus:ring-red-400";

export default function Header() {
  const { currentUser, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className={`px-6 py-4 mb-6 flex items-center justify-between ${cardBase}`}>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <span className="text-gray-500 text-sm">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className={`px-6 py-4 mb-6 flex items-center justify-between ${cardBase}`}>
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
          </svg>

          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            3
          </span>
        </div>

        {/* User Panel */}
        <div className="flex items-center gap-3">
          <span
            className="grid place-items-center w-10 h-10 rounded-full bg-blue-600 text-white shrink-0"
            title={currentUser?.name || "User"}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
              <path d="M9.5 12.5l1.8 1.8 3.2-3.3" />
            </svg>
          </span>

          <span className="text-sm font-medium text-gray-700">
            {currentUser?.email || "Unknown User"}
          </span>

          {/* Logout */}
          <button
            className={btnClass}
            aria-label="Logout"
            title="Logout"
            onClick={handleLogout}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}