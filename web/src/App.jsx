// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import DashboardLayout from "./layout/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Dashboard from "./components/Dashboard";
import LiveFeeds from "./pages/LiveFeeds";
import Alerts from "./pages/Alerts";
import ATMLocations from "./pages/ATMLocations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Loading from "./pages/Loading";
import Opening from "./pages/Opening";

export default function App() {
  return (
    <Routes>
      {/* Opening splash at root */}
      <Route path="/" element={<Opening />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/loading" element={<Loading />} />

      {/* Protected app under /dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="live-feeds" element={<LiveFeeds />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="locations" element={<ATMLocations />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Fallback: go to dashboard (NOT opening page) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
