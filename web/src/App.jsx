import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import DashboardLayout from "./layout/DashboardLayout";

// Pages
import Dashboard from "./components/Dashboard";
import LiveFeeds from "./pages/LiveFeeds";
import Alerts from "./pages/Alerts";
import ATMLocations from "./pages/ATMLocations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="live-feeds" element={<LiveFeeds />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="locations" element={<ATMLocations />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* fallbacks */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
