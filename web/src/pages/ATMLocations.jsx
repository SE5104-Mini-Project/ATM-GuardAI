// web/src/pages/ATMLocations.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ATMLocations() {
  const navigate = useNavigate();

  const cardBase =
    "rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";

  /* ---------- Tiny inline icons (no libs) ---------- */
  const Icon = {
    bell: (
      <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
    mapPin: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    ),
    cam: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="M17 10l4-2v8l-4-2v-4z" />
      </svg>
    ),
    clock: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    live: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M10 9l6 3-6 3V9z" fill="#fff" />
      </svg>
    ),
    history: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 3v6h6" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  };

  /* ---------- Example data (added region for filters) ---------- */
  const locations = [
    {
      id: 12,
      name: "ATM #12 - City Branch",
      status: "alert", // alert | online | offline
      region: "North",
      address: "123 Main Street, City Center",
      cameras: 2,
      lastAlert: "Today, 10:23 AM",
    },
    {
      id: 7,
      name: "ATM #07 - Main Street",
      status: "alert",
      region: "East",
      address: "456 Oak Avenue, Downtown",
      cameras: 2,
      lastAlert: "Today, 09:45 AM",
    },
    {
      id: 15,
      name: "ATM #15 - Hospital Branch",
      status: "online",
      region: "South",
      address: "789 Medical Plaza, Health District",
      cameras: 3,
      lastAlert: "Today, 08:30 AM",
    },
    {
      id: 9,
      name: "ATM #09 - Shopping Mall",
      status: "offline",
      region: "West",
      address: "Mall Blvd, Level 2 – Atrium",
      cameras: 2,
      lastAlert: "Yesterday",
    },
  ];

  /* ---------- Filters ---------- */
  const [statusFilterTop, setStatusFilterTop] = useState("All ATMs"); // top select
  const [statusFilterMap, setStatusFilterMap] = useState("All ATMs"); // map controls
  const [regionFilter, setRegionFilter] = useState("All Regions");

  const toStatus = (x) =>
    x === "All ATMs" ? "all" : x.toLowerCase(); // "alert" | "online" | "offline" | "all"

  const effectiveStatus = useMemo(() => {
    const a = toStatus(statusFilterTop);
    const b = toStatus(statusFilterMap);
    if (a === "all" && b === "all") return "all";
    if (a === "all") return b;
    if (b === "all") return a;
    // both specific: intersect -> must match both (i.e., same value); else impossible -> none
    return a === b ? a : "__none__";
  }, [statusFilterTop, statusFilterMap]);

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      const statusOK =
        effectiveStatus === "all"
          ? true
          : effectiveStatus === "__none__"
          ? false
          : loc.status === effectiveStatus;
      const regionOK = regionFilter === "All Regions" ? true : loc.region === regionFilter;
      return statusOK && regionOK;
    });
  }, [locations, effectiveStatus, regionFilter]);

  const openAlertsCount = useMemo(() => locations.filter((l) => l.status === "alert").length, [locations]);

  const statusPill = (status) => {
    const map = {
      alert: "bg-red-600 text-white",
      online: "bg-emerald-600 text-white",
      offline: "bg-slate-400 text-white",
    };
    const label = status === "alert" ? "Alert" : status === "online" ? "Online" : "Offline";
    return <span className={`px-2 py-0.5 text-xs rounded-full ${map[status]}`}>{label}</span>;
  };

  function LocationCard({ loc }) {
    return (
      <div className="rounded-2xl bg-white shadow-lg">
        {/* top strip */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-[#102a56] text-white">
          <h4 className="font-semibold">{loc.name}</h4>
          {statusPill(loc.status)}
        </div>

        {/* body */}
        <div className="px-5 py-4">
          <div className="text-sm text-slate-800">{loc.address}</div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              {Icon.cam} {loc.cameras} Cameras
            </span>
            <span className="inline-flex items-center gap-2">
              {Icon.clock} Last alert: {loc.lastAlert}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
          <button
            onClick={() => navigate("/live-feeds")}
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900"
          >
            {Icon.live} View Live
          </button>
          <button
            onClick={() => navigate("/reports", { state: { from: "atm-locations", atmId: loc.id } })}
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900"
          >
            {Icon.history} History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold text-gray-900">ATM Locations</h2>
        <div className="flex items-center gap-6">
          <span className="text-sm text-blue-700">
            Last updated: <span className="underline">Just now</span>
          </span>
          <div className="relative">
            {Icon.bell}
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {openAlertsCount}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold grid place-items-center">JS</div>
            <div className="leading-tight">
              <div className="font-medium text-gray-900">John Smith</div>
              <div className="text-sm text-gray-500">Security Officer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section title + top filter */}
      <div className="mb-2 flex items-center gap-3">
        <h3 className="text-xl font-semibold">ATM Locations</h3>
        <select
          value={statusFilterTop}
          onChange={(e) => setStatusFilterTop(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option>All ATMs</option>
          <option>Alert</option>
          <option>Online</option>
          <option>Offline</option>
        </select>
      </div>

      {/* Map placeholder with controls */}
      <div className="relative rounded-2xl border border-slate-200 bg-slate-100/60 shadow-inner min-h-[420px]">
        {/* Placeholder */}
        <div className="absolute inset-0 grid place-items-center text-slate-500">
          <div className="flex flex-col items-center gap-2">
            <div className="opacity-70">{Icon.mapPin}</div>
            <p className="text-sm">Interactive ATM locations map would be displayed here</p>
          </div>
        </div>

        {/* Floating controls */}
        <div className="absolute right-4 top-4 w-64 rounded-xl bg-white shadow-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100 font-semibold">Map Controls</div>
          <div className="p-4 space-y-3 text-sm">
            <label className="block">
              <span className="text-slate-600">Filter by Status:</span>
              <select
                value={statusFilterMap}
                onChange={(e) => setStatusFilterMap(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All ATMs</option>
                <option>Alert</option>
                <option>Online</option>
                <option>Offline</option>
              </select>
            </label>

            <label className="block">
              <span className="text-slate-600">Filter by Region:</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Regions</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
                <option>West</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold">ATM List</h3>
        <button className="text-sm text-blue-700 hover:text-blue-900">
          {filtered.length} ATMs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  );
}
