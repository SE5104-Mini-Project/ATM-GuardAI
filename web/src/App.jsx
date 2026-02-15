import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import DashboardLayout from "./layout/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import LiveFeeds from "./pages/LiveFeeds";
import Alerts from "./pages/Alerts";
import CameraManagement from "./pages/CameraManagement";
import ATMLocations from "./pages/ATMLocations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Loading from "./pages/Loading";
import Opening from "./pages/Opening";

import { AuthContext } from "./context/AuthContext";

// ---------------- PROTECTED ROUTE ---------------- //
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <>
      {/* DARK MODE TOGGLE BUTTON */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition"
      >
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>

      <Routes>
        <Route path="/" element={<Opening />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/loading" element={<Loading />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="live-feeds" element={<LiveFeeds />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="locations" element={<ATMLocations />} />
          <Route path="camera-management" element={<CameraManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
