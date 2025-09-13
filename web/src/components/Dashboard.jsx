import { useState } from "react";
import { Link } from "react-router-dom";

const icon = {
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
  camera: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 5h-3.2l-1-2H8.2l-1 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
    </svg>
  ),
  clock: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a11 11 0 1 0 0 22A11 11 0 0 0 12 1zm1 12H7V11h4V6h2v7z" />
    </svg>
  ),
};

const EyeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm-1 4h2v5h4v2h-6V7z" />
  </svg>
);

/** Shared card style with MEDIUM shadow */
const cardBase =
  "rounded-2xl bg-white shadow-lg transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-xl";

/** Navy header location card */
function LocationCard({ name, status, address, cameras, lastAlert }) {
  const pill = status === "Alert" ? "bg-red-500 text-white" : "bg-green-500 text-white";
  return (
    <div className={`overflow-hidden ring-1 ring-gray-200 ${cardBase}`}>
      <div className="bg-[#0f2a56] text-white px-5 py-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold">{name}</h4>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${pill}`}>{status}</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-gray-900 font-semibold mb-1">{address}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">{cameras}</span> Cameras
          </div>
          <div className="text-right">
            <span className="text-gray-500">Last alert:</span>{" "}
            <span className="font-medium">{lastAlert}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
        <button className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800">
          <EyeIcon />
          <span className="font-medium">View Live</span>
        </button>
        <button className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800">
          <HistoryIcon />
          <span className="font-medium">History</span>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isSidebarOpen] = useState(true);

  const stats = { totalATMs: 24, activeAlerts: 5, camerasOnline: 22, pendingReviews: 12 };

  const recentAlerts = [
    {
      id: 1,
      type: "mask",
      title: "Mask Detected",
      description: "Individual detected wearing facial covering",
      location: "ATM #12 - City Branch",
      time: "10:23 AM",
      action: "Review",
    },
    {
      id: 2,
      type: "helmet",
      title: "Helmet Detected",
      description: "Individual detected wearing helmet",
      location: "ATM #07 - Main Street",
      time: "09:45 AM",
      action: "Review",
    },
    {
      id: 3,
      type: "resolved",
      title: "False Alarm - Resolved",
      description: "Medical mask correctly identified",
      location: "ATM #15 - Hospital Branch",
      time: "08:30 AM",
      action: "Details",
    },
  ];

  const atmLocations = [
    {
      id: 1,
      name: "ATM #12 - City Branch",
      status: "Alert",
      address: "123 Main Street, City Center",
      lastAlert: "10:23 AM",
      cameras: 2,
    },
    {
      id: 2,
      name: "ATM #07 - Main Street",
      status: "Alert",
      address: "456 Oak Avenue, Downtown",
      lastAlert: "09:45 AM",
      cameras: 2,
    },
    {
      id: 3,
      name: "ATM #15 - Hospital Branch",
      status: "Online",
      address: "789 Medical Plaza, Health District",
      lastAlert: "08:30 AM",
      cameras: 3,
    },
  ];

  const alertAccent = (type) =>
    type === "resolved"
      ? "border-green-400 bg-green-100 text-green-800"
      : "border-red-400 bg-red-100 text-red-800";

  return (
    <div className="px-3 sm:px-6 pt-6">
      {/* Header */}
      <div className={`px-5 py-4 mb-6 flex items-center justify-between ${cardBase}`}>
        <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <svg
              className="w-6 h-6 text-gray-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              3
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold grid place-items-center">
              JS
            </div>
            <div className="leading-tight">
              <div className="font-medium text-gray-900">John Smith</div>
              <div className="text-sm text-gray-500">Security Officer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total ATMs", value: stats.totalATMs, color: "blue", icon: icon.atm },
          { label: "Active Alerts", value: stats.activeAlerts, color: "red", icon: icon.danger },
          { label: "Cameras Online", value: stats.camerasOnline, color: "green", icon: icon.camera },
          { label: "Pending Reviews", value: stats.pendingReviews, color: "yellow", icon: icon.clock },
        ].map((c) => (
          <div key={c.label} className={`p-5 flex items-center gap-4 ${cardBase}`}>
            <div className={`rounded-xl p-3 text-${c.color}-700 bg-${c.color}-100`}>
              {c.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p
                className={`text-3xl font-bold ${
                  c.color === "red"
                    ? "text-red-600"
                    : c.color === "green"
                    ? "text-green-600"
                    : c.color === "yellow"
                    ? "text-yellow-600"
                    : "text-gray-900"
                }`}
              >
                {c.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="py-6">
        {/* Recent Alerts */}
        <section className={`${cardBase} mb-6`}>
          <div className="flex items-center justify-between p-6 pb-3">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <Link to="/alerts" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="px-6 pb-6 space-y-3">
            {recentAlerts.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border pl-4 pr-3 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alertAccent(
                  a.type
                )} shadow hover:shadow-md transition-shadow duration-300`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{a.title}</p>
                  <p className="text-sm text-gray-700">{a.description}</p>
                  <div className="mt-1 text-xs text-gray-600 flex flex-wrap items-center gap-3">
                    <span className="truncate">{a.location}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8v5l4 2" />
                        <path
                          d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {a.time}
                    </span>
                  </div>
                </div>
                <button className="sm:ml-3 shrink-0 bg-blue-700 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-900 transition-colors">
                  {a.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ATM Locations */}
        <section className={`-mx-3 sm:-mx-6 rounded-none sm:rounded-2xl ${cardBase}`}>
          <div className="flex items-center justify-between px-3 sm:px-6 pt-6 pb-3">
            <h3 className="text-lg font-semibold text-gray-900">ATM Locations</h3>
            <Link to="/locations" className="text-sm text-blue-600 hover:underline">
              View Map
            </Link>
          </div>

          <div className="px-3 sm:px-6 pb-6 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            {atmLocations.map((atm) => (
              <LocationCard key={atm.id} {...atm} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
