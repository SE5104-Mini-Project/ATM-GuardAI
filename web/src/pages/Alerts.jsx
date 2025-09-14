// src/pages/Alerts.jsx
import { useMemo, useState } from "react";

/* ---------- Tiny inline icons (no libs) ---------- */
const Icon = {
  mask: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path d="M4 10a8 8 0 0116 0v2a6 6 0 01-3.5 5.5l-3.2 1.5a2 2 0 01-1.6 0L8.5 17.5A6 6 0 015 12v-2z" fill="currentColor" />
      <path d="M8 11h3M13 11h3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  helmet: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path d="M12 4a8 8 0 00-8 8v3h16v-3a8 8 0 00-8-8z" fill="currentColor" />
      <path d="M2 18h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7.5 12.5l3 3 6-6" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path d="M12 2L2 22h20L12 2z" fill="currentColor" />
      <path d="M12 8v5m0 4h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 22a9 9 0 1118 0H3z" fill="currentColor" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 7v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cam: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <rect x="3" y="6" width="14" height="12" rx="2" fill="currentColor" />
      <path d="M17 10l4-2v8l-4-2v-4z" fill="currentColor" />
    </svg>
  ),
};

/* ---------- Alerts data ---------- */
const ALERTS = [
  {
    id: "a1",
    type: "Mask Detected",
    severity: "high",
    status: "open",
    icon: "mask",
    description: "Individual detected wearing facial covering",
    location: "ATM #12 - City Branch",
    time: "10:23 AM",
    camera: "Camera 1",
  },
  {
    id: "a2",
    type: "Helmet Detected",
    severity: "medium",
    status: "open",
    icon: "helmet",
    description: "Individual detected wearing helmet",
    location: "ATM #07 - Main Street",
    time: "09:45 AM",
    camera: "Camera 2",
  },
  {
    id: "a3",
    type: "False Alarm - Resolved",
    severity: "ok",
    status: "resolved",
    icon: "check",
    description: "Medical mask correctly identified",
    location: "ATM #15 - Hospital Branch",
    time: "08:30 AM",
    resolvedBy: "John Smith",
  },
  {
    id: "a4",
    type: "Suspicious Activity",
    severity: "high",
    status: "open",
    icon: "alert",
    description: "Multiple failed ATM access attempts detected",
    location: "ATM #21 - Central Mall",
    time: "Yesterday, 07:15 PM",
    camera: "Camera 3",
  },
  {
    id: "a5",
    type: "Unauthorized Access - Resolved",
    severity: "ok",
    status: "resolved",
    icon: "check",
    description: "Backdoor ATM panel access checked and cleared",
    location: "ATM #03 - Riverside Branch",
    time: "Yesterday, 02:10 PM",
    resolvedBy: "Sarah Johnson",
  },
  {
    id: "a6",
    type: "Crowd Detected",
    severity: "medium",
    status: "open",
    icon: "alert",
    description: "Unusually large group near ATM",
    location: "ATM #19 - Metro Station",
    time: "Today, 11:10 AM",
    camera: "Camera 5",
  },
];

/* ---------- Style tokens ---------- */
const STYLE = {
  high: {
    card: "bg-rose-50 border border-rose-300",
    rail: "bg-rose-500",
    iconWrap: "bg-rose-500",
    dot: "bg-rose-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  medium: {
    card: "bg-amber-50 border border-amber-300",
    rail: "bg-amber-500",
    iconWrap: "bg-amber-500",
    dot: "bg-amber-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  ok: {
    card: "bg-emerald-50 border border-emerald-300",
    rail: "bg-emerald-500",
    iconWrap: "bg-emerald-500",
    dot: "bg-emerald-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
};

export default function Alerts() {
  const [filter, setFilter] = useState("All");
  const list = useMemo(() => {
    if (filter === "Open") return ALERTS.filter((a) => a.status === "open");
    if (filter === "Resolved") return ALERTS.filter((a) => a.status === "resolved");
    return ALERTS;
  }, [filter]);

  return (
    <div className="p-6 text-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option>All</option>
          <option>Open</option>
          <option>Resolved</option>
        </select>
      </div>

      <div className="space-y-4">
        {list.map((a) => {
          const s = STYLE[a.severity];
          return (
            <div
              key={a.id}
              className={`group relative overflow-hidden rounded-2xl ${s.card} shadow-md transition-all
                          hover:shadow-xl hover:-translate-y-0.5`}
            >
              <div className={`absolute left-0 top-0 h-full w-[6px] ${s.rail}`} />
              <div className="p-4 sm:p-5 pl-6 sm:pl-7">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className={`grid place-items-center h-10 w-10 rounded-full text-white ${s.iconWrap} shadow-lg`}>
                      {Icon[a.icon]}
                    </div>
                    {a.status === "open" && (
                      <>
                        <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ${s.dot} animate-ping opacity-60`} />
                        <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      </>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold leading-6">{a.type}</h3>
                        <p className="mt-1 text-sm text-slate-700">{a.description}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-slate-400">{Icon.pin}</span>
                            {a.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-slate-400">{Icon.clock}</span>
                            {a.time}
                          </span>
                          {a.camera && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="text-slate-400">{Icon.cam}</span>
                              {a.camera}
                            </span>
                          )}
                          {a.resolvedBy && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="text-slate-400">{Icon.user}</span>
                              Resolved by: {a.resolvedBy}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-1">
                        {a.status === "open" ? (
                          <button
                            className={`rounded-lg px-4 py-2 text-sm font-medium ${s.button} shadow
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                                        transition-transform active:scale-[0.98]`}
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            className={`rounded-lg px-4 py-2 text-sm font-medium ${s.button} shadow
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                                        transition-transform active:scale-[0.98]`}
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity bg-gradient-to-r from-white to-transparent" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
