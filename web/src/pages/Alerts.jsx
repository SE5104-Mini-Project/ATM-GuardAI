import { useEffect, useMemo, useRef, useState, useContext } from "react";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

/* ========== Tiny inline icons ========== */
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
  close: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M3 21v-5h5"></path>
    </svg>
  ),
};

/* ========== Style tokens ========== */
const STYLE = {
  high: {
    card: "bg-rose-50 border border-rose-300",
    rail: "bg-rose-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    badge: "bg-rose-100 text-rose-800 border-rose-200"
  },
  medium: {
    card: "bg-amber-50 border border-amber-300",
    rail: "bg-amber-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    badge: "bg-amber-100 text-amber-800 border-amber-200"
  },
  low: {
    card: "bg-blue-50 border border-blue-300",
    rail: "bg-blue-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    badge: "bg-blue-100 text-blue-800 border-blue-200"
  },
  ok: {
    card: "bg-emerald-50 border border-emerald-300",
    rail: "bg-emerald-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
};

const STATUS_FILTERS = ["All Alerts", "Open Alerts", "Resolved Alerts"];
const TYPE_FILTERS = ["All Types", "Mask Detections", "Helmet Detections"];
const SEVERITY_FILTERS = ["All Severities", "High", "Medium", "Low"];

const API_BASE = "http://localhost:3001/api";

export default function Alerts() {
  const { currentUser } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Alerts");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [severityFilter, setSeverityFilter] = useState("All Severities");
  const [entered, setEntered] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);

  const statusDdRef = useRef(null);
  const typeDdRef = useRef(null);
  const severityDdRef = useRef(null);

  /* ---------- API Functions ---------- */
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/alerts`);
      const result = await response.json();

      if (result.success) {
        setAlerts(result.data.alerts || []);
      } else {
        setError("Failed to fetch alerts");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alertId, updateData) => {
    try {
      setUpdateLoading(true);
      const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();

      if (result.success) {
        await fetchAlerts();
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: "Error updating alert", err };
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        await fetchAlerts();
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: "Error deleting alert", err };
    }
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    fetchAlerts();
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Close dropdowns on outside click / ESC
  useEffect(() => {
    const onClick = (e) => {
      if (statusDdRef.current && !statusDdRef.current.contains(e.target)) setStatusOpen(false);
      if (typeDdRef.current && !typeDdRef.current.contains(e.target)) setTypeOpen(false);
      if (severityDdRef.current && !severityDdRef.current.contains(e.target)) setSeverityOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setStatusOpen(false);
        setTypeOpen(false);
        setSeverityOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ---------- Filtering Logic ---------- */
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Status filter
    if (statusFilter === "Open Alerts") {
      filtered = filtered.filter(alert => alert.status === "open");
    } else if (statusFilter === "Resolved Alerts") {
      filtered = filtered.filter(alert => alert.status === "resolved");
    }

    // Type filter
    if (typeFilter === "Mask Detections") {
      filtered = filtered.filter(alert => alert.type?.toLowerCase().includes("mask"));
    } else if (typeFilter === "Helmet Detections") {
      filtered = filtered.filter(alert => alert.type?.toLowerCase().includes("helmet"));
    }

    // Severity filter
    if (severityFilter !== "All Severities") {
      filtered = filtered.filter(alert =>
        alert.severity?.toLowerCase() === severityFilter.toLowerCase()
      );
    }

    // Sort: open alerts first, then by creation time
    return filtered.sort((a, b) => {
      if (a.status === b.status) {
        return new Date(b.createdTime) - new Date(a.createdTime);
      }
      return a.status === "open" ? -1 : 1;
    });
  }, [alerts, statusFilter, typeFilter, severityFilter]);

  /* ---------- Alert Management Functions ---------- */
  const handleResolveAlert = async (alert) => {
    const updateData = {
      status: "resolved",
      resolvedBy: currentUser?._id || null
    };

    const result = await updateAlert(alert._id, updateData);

    if (result.success) {
      setShowUpdateModal(false);
      setShowResolveConfirm(false);
      setSelectedAlert(null);
    } else {
      alert(result.message);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      const result = await deleteAlert(alertId);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  const openUpdateModal = (alert) => {
    setSelectedAlert(alert);
    setShowUpdateModal(true);
  };

  const openResolveConfirm = (alert) => {
    setSelectedAlert(alert);
    setShowResolveConfirm(true);
    setShowUpdateModal(false);
  };

  /* ---------- Helper Functions ---------- */
  const formatTime = (dateString) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAlertTypeDisplay = (type) => {
    const typeMap = {
      "normal face": "Normal Face Detected",
      "with helmet": "Helmet Detected",
      "with mask": "Mask Detected"
    };
    return typeMap[type] || type;
  };

  const SeverityBadge = ({ severity }) => {
    const config = {
      high: { class: STYLE.high.badge, text: "High" },
      medium: { class: STYLE.medium.badge, text: "Medium" },
      low: { class: STYLE.low.badge, text: "Low" }
    };

    const style = config[severity] || config.low;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${style.class}`}>
        {style.text}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const config = {
      open: { class: "bg-blue-100 text-blue-800 border-blue-200", text: "Open" },
      resolved: { class: "bg-emerald-100 text-emerald-800 border-emerald-200", text: "Resolved" }
    };

    const style = config[status] || config.open;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${style.class}`}>
        {style.text}
      </span>
    );
  };

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <Header title={"Alerts"} />

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* ===== Section title + filters ===== */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-xl font-semibold">Security Alerts</h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Refresh Button */}
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {Icon.refresh}
            {loading ? "Loading..." : "Refresh"}
          </button>

          {/* Severity Filter */}
          <div ref={severityDdRef} className="relative w-full sm:w-48">
            <button
              type="button"
              onClick={() => setSeverityOpen((v) => !v)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
                          transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500
                          ${severityOpen ? "ring-2 ring-indigo-500" : ""}`}
            >
              <span className="truncate">{severityFilter}</span>
              <span className={`transition-transform ${severityOpen ? "rotate-180" : ""}`}>{Icon.caret}</span>
            </button>
            <div
              className={`absolute right-0 z-20 mt-2 w-full origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg
                          transition-all duration-150
                          ${severityOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
            >
              {SEVERITY_FILTERS.map((opt) => {
                const active = opt === severityFilter;
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      setSeverityFilter(opt);
                      setSeverityOpen(false);
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

          {/* Type Filter */}
          <div ref={typeDdRef} className="relative w-full sm:w-48">
            <button
              type="button"
              onClick={() => setTypeOpen((v) => !v)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
                          transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500
                          ${typeOpen ? "ring-2 ring-indigo-500" : ""}`}
            >
              <span className="truncate">{typeFilter}</span>
              <span className={`transition-transform ${typeOpen ? "rotate-180" : ""}`}>{Icon.caret}</span>
            </button>
            <div
              className={`absolute right-0 z-20 mt-2 w-full origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg
                          transition-all duration-150
                          ${typeOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
            >
              {TYPE_FILTERS.map((opt) => {
                const active = opt === typeFilter;
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      setTypeFilter(opt);
                      setTypeOpen(false);
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

          {/* Status Filter */}
          <div ref={statusDdRef} className="relative w-full sm:w-48">
            <button
              type="button"
              onClick={() => setStatusOpen((v) => !v)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
                          transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500
                          ${statusOpen ? "ring-2 ring-indigo-500" : ""}`}
            >
              <span className="truncate">{statusFilter}</span>
              <span className={`transition-transform ${statusOpen ? "rotate-180" : ""}`}>{Icon.caret}</span>
            </button>
            <div
              className={`absolute right-0 z-20 mt-2 w-full origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg
                          transition-all duration-150
                          ${statusOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
            >
              {STATUS_FILTERS.map((opt) => {
                const active = opt === statusFilter;
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setStatusOpen(false);
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      )}

      {/* ===== Alerts list ===== */}
      {!loading && (
        <div className="space-y-4">
          {filteredAlerts.map((alert, idx) => {
            const style = STYLE[alert.severity] || STYLE.low;
            const isResolved = alert.status === "resolved";

            return (
              <div
                key={alert._id}
                className={`relative overflow-hidden rounded-2xl ${isResolved ? STYLE.ok.card : style.card} shadow-md transition-all
                            hover:shadow-xl hover:-translate-y-0.5
                            ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{ transitionDelay: `${idx * 30}ms` }}
              >
                <div className={`absolute left-0 top-0 h-full w-[6px] ${isResolved ? STYLE.ok.rail : style.rail}`} />
                <div className="p-4 sm:p-5 pl-6 sm:pl-7">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold leading-6">{getAlertTypeDisplay(alert.type)}</h4>
                        <SeverityBadge severity={alert.severity} />
                        <StatusBadge status={alert.status} />
                        {alert.confidence > 0 && (
                          <span className="text-sm text-slate-500">
                            Confidence: {alert.confidence}%
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-700 mb-3">{alert.description}</p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                        {alert.cameraId && (
                          <span className="inline-flex items-center gap-1.5">
                            {Icon.cam} {alert.cameraId.name || `Camera ${alert.cameraId._id}`}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          {Icon.clock} {formatTime(alert.createdTime)}
                        </span>
                        {isResolved && alert.resolvedBy && (
                          <span className="inline-flex items-center gap-1.5">
                            {Icon.userCircle} Resolved by: {alert.resolvedBy.name || "System"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {!isResolved ? (
                        <>
                          <button
                            onClick={() => openUpdateModal(alert)}
                            className={`${style.button} rounded-lg px-4 py-2 text-sm font-medium shadow`}
                          >
                            Review
                          </button>
                          {currentUser?.role === "admin" && (
                            <button
                              onClick={() => handleDeleteAlert(alert._id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium shadow"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {currentUser?.role === "admin" && (
                            <button
                              onClick={() => handleDeleteAlert(alert._id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium shadow"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 transition-opacity hover:opacity-[0.06]" />
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setStatusFilter("All Alerts");
              setTypeFilter("All Types");
              setSeverityFilter("All Severities");
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Update Alert Modal */}
      {showUpdateModal && selectedAlert && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#102a56] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review Alert</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={updateLoading}
              >
                {Icon.close}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Type
                  </label>
                  <p className="text-sm text-gray-900 font-medium">{getAlertTypeDisplay(selectedAlert.type)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-600">{selectedAlert.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera
                  </label>
                  <p className="text-sm text-gray-600">
                    {selectedAlert.cameraId?.name || `Camera ${selectedAlert.cameraId?._id}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <SeverityBadge severity={selectedAlert.severity} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confidence
                    </label>
                    <p className="text-sm text-gray-600">{selectedAlert.confidence}%</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detected
                  </label>
                  <p className="text-sm text-gray-600">{formatTime(selectedAlert.createdTime)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolved By
                  </label>
                  <p className="text-sm text-gray-600">{currentUser?.name || "Current User"}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowUpdateModal(false)}
                disabled={updateLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => openResolveConfirm(selectedAlert)}
                disabled={updateLoading}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Confirmation Modal */}
      {showResolveConfirm && selectedAlert && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#102a56] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-semibold">Confirm Resolution</h3>
              <button
                onClick={() => setShowResolveConfirm(false)}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={updateLoading}
              >
                {Icon.close}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-center mb-2">Mark this alert as resolved?</h4>

              <div className="text-center text-gray-600 mb-6">
                <p className="mb-2">Alert: <strong>{getAlertTypeDisplay(selectedAlert.type)}</strong></p>
                <p>This action will be recorded under your name: <strong>{currentUser?.name || "Current User"}</strong></p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-yellow-800">
                    Once resolved, this alert will be moved to the "Resolved Alerts" section and cannot be reopened.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowResolveConfirm(false)}
                disabled={updateLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveAlert(selectedAlert)}
                disabled={updateLoading}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Resolving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yes, Mark as Resolved
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}