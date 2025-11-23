import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
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
  return (
    <Routes>
      <Route path="/" element={<Opening />} />

      {/* public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/loading" element={<Loading />} />

      {/* PROTECTED DASHBOARD */}
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
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}