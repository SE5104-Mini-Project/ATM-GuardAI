// src/components/Dashboard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const icon = {
  // Outline, color inherited from parent via currentColor
  atm: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
      <rect x="6.5" y="9" width="5.5" height="6" rx="1"></rect>
      <path d="M15 9h3.5"></path>
    </svg>
  ),
  danger: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <path d="M12 9v4"></path>
      <circle cx="12" cy="17" r="1"></circle>
    </svg>
  ),
  camera: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3 2"></path>
    </svg>
  ),
};

const EyeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 3-6.7"></path>
    <path d="M3 3v5h5"></path>
    <path d="M12 7v5l3 2"></path>
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
            <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
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

      {/* Stats (updated with tinted icon pills & matching colors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total ATMs",
            value: stats.totalATMs,
            icon: icon.atm,
            iconWrap: "bg-blue-50 ring-blue-200 text-blue-600",
            valueClass: "text-gray-900",
          },
          {
            label: "Active Alerts",
            value: stats.activeAlerts,
            icon: icon.danger,
            iconWrap: "bg-rose-50 ring-rose-200 text-rose-600",
            valueClass: "text-gray-900",
          },
          {
            label: "Cameras Online",
            value: stats.camerasOnline,
            icon: icon.camera,
            iconWrap: "bg-emerald-50 ring-emerald-200 text-emerald-600",
            valueClass: "text-gray-900",
          },
          {
            label: "Pending Reviews",
            value: stats.pendingReviews,
            icon: icon.clock,
            iconWrap: "bg-amber-50 ring-amber-200 text-amber-600",
            valueClass: "text-gray-900",
          },
        ].map((c) => (
          <div key={c.label} className={`p-5 flex items-center gap-4 ${cardBase}`}>
            <div className={`rounded-xl p-3 ring-1 ${c.iconWrap}`}>{c.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold ${c.valueClass}`}>{c.value}</p>
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
                className={`relative rounded-xl border pl-4 pr-3 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow hover:shadow-md transition-shadow duration-300
                  ${a.type === "resolved"
                    ? "border-green-400 bg-green-50"
                    : a.type === "helmet"
                    ? "border-amber-400 bg-amber-50"
                    : "border-rose-400 bg-rose-50"}`}
              >
                {/* Colored strip */}
                <div
                  className={`absolute top-0 left-0 h-full w-2 rounded-l-xl
                    ${a.type === "resolved" ? "bg-green-500" : a.type === "helmet" ? "bg-amber-500" : "bg-rose-500"}`}
                ></div>

                {/* Content */}
                <div className="flex-1 min-w-0 pl-3">
                  <p className="font-semibold text-gray-900">{a.title}</p>
                  <p className="text-sm text-gray-700">{a.description}</p>
                  <div className="mt-1 text-xs text-gray-600 flex flex-wrap items-center gap-3">
                    <span className="truncate">{a.location}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v5l4 2" />
                        <circle cx="12" cy="12" r="9" />
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
