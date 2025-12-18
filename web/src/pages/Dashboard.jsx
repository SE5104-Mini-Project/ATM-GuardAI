import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";

const icon = {
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
  refresh: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M3 21v-5h5"></path>
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

const cardBase = "rounded-2xl bg-white shadow-lg transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-xl";

function LocationCard({ name, status, address, cameras, lastAlert, cameraId }) {
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
        <Link
          to="/loading"
          state={{ to: `/dashboard/live-feeds?camera=${cameraId}`, delayMs: 700 }}
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
        >
          <EyeIcon />
          <span className="font-medium">View Live</span>
        </Link>
        <Link
          to="/loading"
          state={{ to: "/dashboard/reports", delayMs: 700 }}
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
        >
          <HistoryIcon />
          <span className="font-medium">History</span>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalATMs: 0,
    activeAlerts: 0,
    camerasOnline: 0,
    pendingReviews: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [atmLocations, setAtmLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [camerasResponse, alertsResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/cameras'),
        axios.get('http://localhost:3001/api/alerts')
      ]);

      const cameras = camerasResponse.data.data || [];
      const alerts = alertsResponse.data.data?.alerts || [];

      // Calculate stats
      const totalATMs = cameras.length;
      const onlineCameras = cameras.filter(camera => camera.status === "online").length;
      const activeAlerts = alerts.filter(alert => alert.status === "open").length;
      const pendingReviews = alerts.filter(alert => alert.status === "open").length;

      setStats({
        totalATMs,
        activeAlerts,
        camerasOnline: onlineCameras,
        pendingReviews
      });

      // Process recent alerts (last 3 open alerts)
      const processedAlerts = alerts
        .filter(alert => alert.status === "open")
        .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
        .slice(0, 3)
        .map(alert => {
          let type = "normal";
          let title = "Face Detected";
          let description = "Individual detected";

          if (alert.type === "with mask") {
            type = "mask";
            title = "Mask Detected";
            description = "Individual detected wearing facial covering";
          } else if (alert.type === "with helmet") {
            type = "helmet";
            title = "Helmet Detected";
            description = "Individual detected wearing helmet";
          }

          const alertTime = new Date(alert.createdTime);
          const timeString = alertTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Find camera info from cameras array if not populated
          let cameraName = "Unknown Location";
          if (alert.cameraId) {
            if (typeof alert.cameraId === 'object' && alert.cameraId.name) {
              cameraName = alert.cameraId.name;
            } else if (typeof alert.cameraId === 'string') {
              const camera = cameras.find(c => c._id === alert.cameraId);
              cameraName = camera?.name || alert.cameraId;
            }
          }

          return {
            id: alert._id,
            type,
            title,
            description,
            location: cameraName,
            time: timeString,
            action: "Review",
          };
        });

      setRecentAlerts(processedAlerts);

      // Process ATM locations
      const processedLocations = cameras.slice(0, 3).map(camera => {
        const cameraAlerts = alerts.filter(alert => alert.cameraId?._id === camera._id);
        const latestAlert = cameraAlerts
          .filter(alert => alert.status === "open")
          .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))[0];

        const hasActiveAlert = cameraAlerts.some(alert => alert.status === "open");

        let lastAlertTime = "No alerts";
        if (latestAlert) {
          const alertTime = new Date(latestAlert.createdTime);
          lastAlertTime = alertTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return {
          id: camera._id,
          name: camera.name,
          status: hasActiveAlert ? "Alert" : "Online",
          address: camera.address,
          lastAlert: lastAlertTime,
          cameras: 1,
          cameraId: camera._id
        };
      });

      setAtmLocations(processedLocations);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");

      // Set fallback data
      setStats({ totalATMs: 0, activeAlerts: 0, camerasOnline: 0, pendingReviews: 0 });
      setRecentAlerts([]);
      setAtmLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (error && !loading) {
    return (
      <div className="px-3 sm:px-6 pt-6">
        <Header title={"Security Dashboard"} />
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-lg text-red-600">{error}</div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pt-6">
      {/* Header */}
      <Header title={"Security Dashboard"} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total ATMs", value: stats.totalATMs, icon: icon.atm, iconWrap: "bg-blue-50 ring-blue-200 text-blue-600", valueClass: "text-gray-900" },
          { label: "Active Alerts", value: stats.activeAlerts, icon: icon.danger, iconWrap: "bg-rose-50 ring-rose-200 text-rose-600", valueClass: "text-gray-900" },
          { label: "Cameras Online", value: stats.camerasOnline, icon: icon.camera, iconWrap: "bg-emerald-50 ring-emerald-200 text-emerald-600", valueClass: "text-gray-900" },
          { label: "Pending Reviews", value: stats.pendingReviews, icon: icon.clock, iconWrap: "bg-amber-50 ring-amber-200 text-amber-600", valueClass: "text-gray-900" },
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

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Content */}
          <div className="py-6">
            {/* Recent Alerts */}
            <section className={`${cardBase} mb-6`}>
              <div className="flex items-center justify-between p-6 pb-3">
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {icon.refresh}
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                  <Link
                    to="/loading"
                    state={{ to: "/dashboard/alerts", delayMs: 700 }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-3">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((a) => (
                    <div
                      key={a.id}
                      className={`relative rounded-xl border pl-4 pr-3 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow hover:shadow-md transition-shadow duration-300
                          ${a.type === "resolved"
                          ? "border-green-400 bg-green-50"
                          : a.type === "helmet"
                            ? "border-amber-400 bg-amber-50"
                            : a.type === "mask"
                              ? "border-orange-400 bg-orange-50"
                              : "border-rose-400 bg-rose-50"}`}
                    >
                      {/* Colored strip */}
                      <div
                        className={`absolute top-0 left-0 h-full w-2 rounded-l-xl
                            ${a.type === "resolved" ? "bg-green-500"
                            : a.type === "helmet" ? "bg-amber-500"
                              : a.type === "mask" ? "bg-orange-500"
                                : "bg-rose-500"}`}
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

                      <Link
                        to="/loading"
                        state={{ to: "/dashboard/alerts", delayMs: 700 }}
                        className="sm:ml-3 shrink-0 bg-blue-700 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-900 transition-colors"
                      >
                        {a.action}
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active alerts found
                  </div>
                )}
              </div>
            </section>

            {/* ATM Locations */}
            <div className="py-6">
              <section className={`-mx-3 sm:-mx-6 rounded-none sm:rounded-2xl ${cardBase}`}>
                <div className="flex items-center justify-between px-3 sm:px-6 pt-6 pb-3">
                  <h3 className="text-lg font-semibold text-gray-900">ATM Locations</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {icon.refresh}
                      {loading ? "Loading..." : "Refresh"}
                    </button>
                    <Link
                      to="/loading"
                      state={{ to: "/dashboard/camera-management", delayMs: 700 }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                </div>

                <div className="px-3 sm:px-6 pb-6 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
                  {atmLocations.length > 0 ? (
                    atmLocations.map((atm) => (
                      <LocationCard key={atm.id} {...atm} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No camera locations found
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}