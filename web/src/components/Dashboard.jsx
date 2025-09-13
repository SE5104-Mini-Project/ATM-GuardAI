// src/components/Dashboard.jsx
import { useState } from "react";

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
  atm: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 2h4v6H7V9z" />
    </svg>
  ),
  danger: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-6h-2v5h2v-5z" />
    </svg>
  ),
  video: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7a2 2 0 0 0-2-2H3A2 2 0 0 0 1 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z" />
    </svg>
  ),
  clock: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1zm1 12H7V11h4V6h2v7z" />
    </svg>
  ),
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const stats = { totalATMs: 24, activeAlerts: 5, camerasOnline: 22, pendingReviews: 12 };

  const recentAlerts = [
    { id: 1, type: "mask", title: "Mask Detected", description: "Individual detected wearing facial covering", location: "ATM #12 - City Branch", time: "10:23 AM", action: "Review" },
    { id: 2, type: "helmet", title: "Helmet Detected", description: "Individual detected wearing helmet", location: "ATM #07 - Main Street", time: "09:45 AM", action: "Review" },
    { id: 3, type: "resolved", title: "False Alarm - Resolved", description: "Medical mask correctly identified", location: "ATM #15 - Hospital Branch", time: "08:30 AM", action: "Details" },
  ];

  const atmLocations = [
    { id: 1, name: "ATM #12 - City Branch", status: "Alert", address: "123 Main Street, City Center", lastAlert: "10:23 AM", cameras: 2 },
    { id: 2, name: "ATM #07 - Main Street", status: "Alert", address: "456 Oak Avenue, Downtown", lastAlert: "09:45 AM", cameras: 2 },
    { id: 3, name: "ATM #15 - Hospital Branch", status: "Online", address: "789 Medical Plaza, Health District", lastAlert: "08:30 AM", cameras: 3 },
  ];

  const alertAccent = (type) =>
    type === "resolved"
      ? "border-green-300 bg-green-50 text-green-700"
      : "border-red-300 bg-red-50 text-red-700";

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-blue-900 text-white w-64 flex-shrink-0 ${isSidebarOpen ? "block" : "hidden"} md:block`}>
        <div className="px-5 py-4 border-b border-blue-800">
          <h1 className="text-xl font-extrabold tracking-tight">ATM GuardAI</h1>
        </div>
        <nav className="px-2 py-4">
          {[
            { label: "Dashboard", icon: icon.dashboards, active: true },
            { label: "Live Feeds", icon: icon.camera },
            { label: "Alerts", icon: icon.alerts },
            { label: "ATM Locations", icon: icon.map },
            { label: "Reports", icon: icon.reports },
            { label: "Settings", icon: icon.settings },
            { label: "Users", icon: icon.users },
          ].map((item) => (
            <a key={item.label} href="#" className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 text-sm ${item.active ? "bg-blue-800" : "hover:bg-blue-800/60"}`}>
              <span className="text-blue-200">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 pr-2 sm:pr-4">
        <div className="px-3 sm:px-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Dashboard</h2>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total ATMs", value: stats.totalATMs, color: "blue", icon: icon.atm },
              { label: "Active Alerts", value: stats.activeAlerts, color: "red", icon: icon.danger },
              { label: "Cameras Online", value: stats.camerasOnline, color: "green", icon: icon.camera },
              { label: "Pending Reviews", value: stats.pendingReviews, color: "yellow", icon: icon.clock },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                <div className={`rounded-xl p-3 text-${c.color}-700 bg-${c.color}-100`}>{c.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`text-3xl font-bold ${c.color === "red" ? "text-red-600" : c.color === "green" ? "text-green-600" : c.color === "yellow" ? "text-yellow-600" : "text-gray-900"}`}>
                    {c.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-3 sm:px-6 py-6">
          {/* Recent Alerts */}
          <section className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex items-center justify-between p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              <a href="#" className="text-sm text-blue-600 hover:underline">View All</a>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {recentAlerts.map((a) => (
                <div key={a.id} className={`rounded-lg border pl-4 pr-3 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alertAccent(a.type)}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600">{a.description}</p>
                    <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                      <span className="truncate">{a.location}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 8v5l4 2" />
                          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {a.time}
                      </span>
                    </div>
                  </div>
                  <button className="sm:ml-3 shrink-0 bg-blue-600 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-700">
                    {a.action}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ATM Locations — FULL BLEED */}
          <section className="bg-white shadow-sm -mx-3 sm:-mx-6 rounded-none sm:rounded-xl">
            {/* header */}
            <div className="flex items-center justify-between px-3 sm:px-6 pt-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">ATM Locations</h3>
              <a href="#" className="text-sm text-blue-600 hover:underline">View Map</a>
            </div>

            {/* grid spans full width; cards auto-fit to fill row */}
            <div className="px-3 sm:px-6 pb-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {atmLocations.map((atm) => (
                <div key={atm.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-gray-900">{atm.name}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${atm.status === "Alert" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {atm.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{atm.address}</p>
                  <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                    <span>{atm.cameras} Cameras</span>
                    <span>Last alert: {atm.lastAlert}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-md hover:bg-blue-700">View Live</button>
                    <button className="flex-1 bg-gray-200 text-gray-800 text-xs py-2 rounded-md hover:bg-gray-300">History</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
