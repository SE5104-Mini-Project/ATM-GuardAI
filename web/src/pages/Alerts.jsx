import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";

/* ========== Tiny inline icons (kept only small ones for details row) ========== */
const Icon = {
  bell: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-500" fill="currentColor">
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  ),
  userCircle: (
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
  caret: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M7 10l5 5 5-5" fill="currentColor" />
    </svg>
  ),
  tick: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M6 13l4 4 8-8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
};

/* ========== Alerts data (open at top, resolved later) ========== */
const ALERTS = [
  { id: "a1", type: "Mask Detected", severity: "high", status: "open", description: "Individual detected wearing facial covering", location: "ATM #12 - City Branch", time: "Today, 10:23 AM", camera: "Camera 1" },
  { id: "a2", type: "Helmet Detected", severity: "medium", status: "open", description: "Individual detected wearing helmet", location: "ATM #07 - Main Street", time: "Today, 09:45 AM", camera: "Camera 2" },
  { id: "a4", type: "Suspicious Activity", severity: "high", status: "open", description: "Multiple failed ATM access attempts detected", location: "ATM #21 - Central Mall", time: "Yesterday, 07:15 PM", camera: "Camera 3" },
  { id: "a6", type: "Crowd Detected", severity: "medium", status: "open", description: "Unusually large group near ATM", location: "ATM #19 - Metro Station", time: "Today, 11:10 AM", camera: "Camera 5" },
  { id: "a3", type: "False Alarm - Resolved", severity: "ok", status: "resolved", description: "Medical mask correctly identified", location: "ATM #15 - Hospital Branch", time: "Today, 08:30 AM", resolvedBy: "John Smith" },
  { id: "a5", type: "Unauthorized Access - Resolved", severity: "ok", status: "resolved", description: "Backdoor ATM panel access checked and cleared", location: "ATM #03 - Riverside Branch", time: "Yesterday, 02:10 PM", resolvedBy: "Sarah Johnson" },
];

/* ========== Style tokens ========== */
const STYLE = {
  high: { card: "bg-rose-50 border border-rose-300", rail: "bg-rose-500", button: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  medium: { card: "bg-amber-50 border border-amber-300", rail: "bg-amber-500", button: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  ok: { card: "bg-emerald-50 border border-emerald-300", rail: "bg-emerald-500", button: "bg-indigo-600 hover:bg-indigo-700 text-white" },
};

const FILTERS = ["All Alerts", "Mask Detections", "Helmet Detections", "Resolved"];

export default function Alerts() {

  const [filter, setFilter] = useState("All Alerts");
  const [entered, setEntered] = useState(false);

  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  // close dropdown on outside click / ESC
  useEffect(() => {
    const onClick = (e) => {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const filtered = useMemo(() => {
    let arr = ALERTS;
    if (filter === "Mask Detections") arr = ALERTS.filter((a) => a.type.toLowerCase().includes("mask"));
    else if (filter === "Helmet Detections") arr = ALERTS.filter((a) => a.type.toLowerCase().includes("helmet"));
    else if (filter === "Resolved") arr = ALERTS.filter((a) => a.status === "resolved");
    return [...arr].sort((a, b) => (a.status === "resolved") - (b.status === "resolved"));
  }, [filter]);

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* header */}
      <Header title={"Alerts"} />

      {/* ===== Section title + custom dropdown ===== */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Security Alerts</h3>
        <div ref={ddRef} className="relative w-full sm:w-72">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
                        transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${open ? "ring-2 ring-indigo-500" : ""}`}
          >
            <span className="truncate">{filter}</span>
            <span className={`transition-transform ${open ? "rotate-180" : ""}`}>{Icon.caret}</span>
          </button>
          <div
            className={`absolute right-0 z-20 mt-2 w-full origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg
                        transition-all duration-150
                        ${open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
          >
            {FILTERS.map((opt) => {
              const active = opt === filter;
              return (
                <div
                  key={opt}
                  onClick={() => {
                    setFilter(opt);
                    setOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm
                              hover:bg-slate-50 ${active ? "bg-slate-50 font-medium" : ""}`}
                >
                  <span>{opt}</span>
                  {active && <span className="text-indigo-600">{Icon.tick}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Alerts list ===== */}
      <div className="space-y-4">
        {filtered.map((a, idx) => {
          const s = STYLE[a.severity];
          return (
            <div
              key={a.id}
              className={`relative overflow-hidden rounded-2xl ${s.card} shadow-md transition-all
                          hover:shadow-xl hover:-translate-y-0.5
                          ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              style={{ transitionDelay: `${idx * 30}ms` }}
            >
              <div className={`absolute left-0 top-0 h-full w-[6px] ${s.rail}`} />
              <div className="p-4 sm:p-5 pl-6 sm:pl-7">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold leading-6">{a.type}</h4>
                    <p className="mt-1 text-sm text-slate-700">{a.description}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        {Icon.pin} {a.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        {Icon.clock} {a.time}
                      </span>
                      {a.camera && (
                        <span className="inline-flex items-center gap-1.5">
                          {Icon.cam} {a.camera}
                        </span>
                      )}
                      {a.resolvedBy && (
                        <span className="inline-flex items-center gap-1.5">
                          {Icon.userCircle} Resolved by: {a.resolvedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    {a.status === "open" ? (
                      <button className={`${s.button} rounded-lg px-4 py-2 text-sm font-medium shadow`}>
                        Review
                      </button>
                    ) : (
                      <button className={`${s.button} rounded-lg px-4 py-2 text-sm font-medium shadow`}>
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 transition-opacity hover:opacity-[0.06]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
