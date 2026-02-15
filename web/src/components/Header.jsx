import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const cardBase =
  "rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";

export default function Header({ title }) {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`px-6 py-4 mb-6 flex items-center justify-between ${cardBase}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      <div className="flex items-center gap-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentUser?.email}
        </span>

        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full
          bg-white dark:bg-gray-700
          border border-red-400
          hover:bg-red-100 dark:hover:bg-red-900
          transition-all duration-200"
        >
          <svg
            className="w-4 h-4 text-red-700 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
