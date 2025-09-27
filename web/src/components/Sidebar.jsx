// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const icon = {
  dashboards: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z" />
    </svg>
  ),
  alerts: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-6h-2v5h2v-5z" />
    </svg>
  ),
  camera: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 5h-3.2l-1-2H8.2l-1 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
    </svg>
  ),
  map: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 4l-6 2-6-2v16l6 2 6-2 6 2V6l-6-2zM9 6l6-2v14l-6 2V6z" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h14l4 4v14a2 2 0 0 1-2 2H3V3zm13 1.5V8h3.5L16 4.5z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94a7.48 7.48 0 0 0 .05-.94 7.48 7.48 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.23 7.23 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.57.22-1.12.52-1.63.94l-2.39-.96a.5.5 0 0 0-.61.22L2.66 8.83a.5.5 0 0 0 .12.65l2.03 1.58c-.03.31-.05.63-.05.94s.02.63.05.94L2.78 14.5a.5.5 0 0 0-.12.65l1.92 3.32c.13.22.39.31.61.22l2.39-.96c.5.41 1.05.73 1.63.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54c.57-.22 1.12-.52 1.63-.94l2.39.96c.22.09.48 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.65l-2.03-1.56zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-2.66-5.33-4-8-4zm8 0c-.66 0-1.3.06-1.9.16 1.16.84 1.9 1.97 1.9 3.34V19h8v-1.5c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
};

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 bg-[#0f2a56] text-white w-64 h-screen shadow-lg">
      {/* Logo section */}
      <div className="px-5 py-6 flex items-center justify-center border-b border-blue-800">
        {/* 🔹 Make logo go to /dashboard instead of / */}
        <NavLink to="/dashboard" end>
          <img
            src="/logo4-white.png"
            alt="ATM Guard AI Logo"
            className="w-44 h-auto object-contain cursor-pointer transition duration-300 ease-in-out hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(0,70,255,0.9)]"
            draggable="false"
          />
        </NavLink>
      </div>

      {/* Navigation links */}
      <nav className="mt-4 px-2">
        {[
          { label: "Dashboard", icon: icon.dashboards, to: "/dashboard" },
          { label: "Live Feeds", icon: icon.camera, to: "/dashboard/live-feeds" },
          { label: "Alerts", icon: icon.alerts, to: "/dashboard/alerts" },
          { label: "ATM Locations", icon: icon.map, to: "/dashboard/locations" },
          { label: "Reports", icon: icon.reports, to: "/dashboard/reports" },
          { label: "Settings", icon: icon.settings, to: "/dashboard/settings" },
          { label: "Users", icon: icon.users, to: "/dashboard/users" },
        ].map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-200 hover:bg-blue-700 hover:text-white"
              }`
            }
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
