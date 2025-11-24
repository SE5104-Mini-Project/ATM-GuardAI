import { useMemo, useState, useEffect } from "react";
import Header from "../components/Header";

export default function Reports() {
  const Icon = {
    bell: (
      <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
    download: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10m0 0l4-4m-4 4l-4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 20h14v-4H5v4z" />
      </svg>
    ),
    play: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" />
        <path d="M10 9l6 3-6 3V9z" fill="#fff" />
      </svg>
    ),
  };

  // State for data and filters
  const [alerts, setAlerts] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("alerts");

  // Filters
  const [period, setPeriod] = useState("Last 7 Days");
  const [cameraFilter, setCameraFilter] = useState("All Cameras");
  const [alertType, setAlertType] = useState("All Alerts");
  const [severityFilter, setSeverityFilter] = useState("All Severities");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Camera filters
  const [cameraStatusFilter, setCameraStatusFilter] = useState("All Status");
  const [cameraProvinceFilter, setCameraProvinceFilter] = useState("All Provinces");
  const [cameraDistrictFilter, setCameraDistrictFilter] = useState("All Districts");

  // Generate button state
  const [generatedAt, setGeneratedAt] = useState(new Date());

  // Fetch cameras on component mount
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/cameras');
      if (!response.ok) throw new Error('Failed to fetch cameras');
      const result = await response.json();
      if (result.success) {
        setCameras(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch cameras');
      }
    } catch (err) {
      console.error('Error fetching cameras:', err);
      setError('Failed to load cameras: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('http://localhost:3001/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data.alerts || []);
        setGeneratedAt(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Apply camera filter
    if (cameraFilter !== "All Cameras") {
      filtered = filtered.filter(alert => alert.cameraId?._id === cameraFilter);
    }

    // Apply alert type filter
    if (alertType !== "All Alerts") {
      if (alertType === "Mask") {
        filtered = filtered.filter(alert => alert.type === "with mask");
      } else if (alertType === "Helmet") {
        filtered = filtered.filter(alert => alert.type === "with helmet");
      } else if (alertType === "False Positive") {
        filtered = filtered.filter(alert => (alert.confidence || 0) < 50);
      }
    }

    // Apply severity filter
    if (severityFilter !== "All Severities") {
      filtered = filtered.filter(alert => alert.severity === severityFilter.toLowerCase());
    }

    // Apply status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter(alert => alert.status === statusFilter.toLowerCase());
    }

    // Apply time period filter
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "Last 24 Hours":
        startDate.setDate(now.getDate() - 1);
        break;
      case "Last 7 Days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "Last 30 Days":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    filtered = filtered.filter(alert => {
      const alertDate = new Date(alert.createdTime || alert.createdAt);
      return alertDate >= startDate;
    });

    return filtered;
  }, [alerts, cameraFilter, alertType, severityFilter, statusFilter, period]);

  // Apply filters to cameras
  const filteredCameras = useMemo(() => {
    let filtered = [...cameras];

    // Apply status filter
    if (cameraStatusFilter !== "All Status") {
      filtered = filtered.filter(camera => camera.status === cameraStatusFilter.toLowerCase());
    }

    // Apply province filter
    if (cameraProvinceFilter !== "All Provinces") {
      filtered = filtered.filter(camera => camera.province === cameraProvinceFilter);
    }

    // Apply district filter
    if (cameraDistrictFilter !== "All Districts") {
      filtered = filtered.filter(camera => camera.district === cameraDistrictFilter);
    }

    return filtered;
  }, [cameras, cameraStatusFilter, cameraProvinceFilter, cameraDistrictFilter]);

  // Calculate totals and statistics for alerts
  const statistics = useMemo(() => {
    const stats = {
      totalAlerts: filteredAlerts.length,
      maskAlerts: filteredAlerts.filter(a => a.type === "with mask").length,
      helmetAlerts: filteredAlerts.filter(a => a.type === "with helmet").length,
      openAlerts: filteredAlerts.filter(a => a.status === "open").length,
      resolvedAlerts: filteredAlerts.filter(a => a.status === "resolved").length,
      highSeverity: filteredAlerts.filter(a => a.severity === "high").length,
      mediumSeverity: filteredAlerts.filter(a => a.severity === "medium").length,
      lowSeverity: filteredAlerts.filter(a => a.severity === "low").length,
    };

    // Calculate average confidence
    const totalConfidence = filteredAlerts.reduce((sum, alert) => sum + (alert.confidence || 0), 0);
    stats.averageConfidence = filteredAlerts.length > 0 ? (totalConfidence / filteredAlerts.length).toFixed(1) : 0;

    return stats;
  }, [filteredAlerts]);

  // Calculate camera statistics
  const cameraStatistics = useMemo(() => {
    const stats = {
      totalCameras: filteredCameras.length,
      onlineCameras: filteredCameras.filter(c => c.status === "online").length,
      offlineCameras: filteredCameras.filter(c => c.status === "offline").length,
      uniqueProvinces: [...new Set(filteredCameras.map(c => c.province).filter(Boolean))].length,
      uniqueDistricts: [...new Set(filteredCameras.map(c => c.district).filter(Boolean))].length,
      uniqueBanks: [...new Set(filteredCameras.map(c => c.bankName).filter(Boolean))].length,
    };

    stats.uptimePercentage = stats.totalCameras > 0 ?
      ((stats.onlineCameras / stats.totalCameras) * 100).toFixed(1) : 0;

    return stats;
  }, [filteredCameras]);

  const onGenerate = () => {
    if (activeTab === "alerts") {
      fetchAlerts();
    } else {
      fetchCameras();
    }
  };

  const exportAlertsCSV = () => {
    const header = [
      "Alert ID",
      "Date & Time",
      "Camera Name",
      "Bank Name",
      "Branch",
      "Location",
      "Coordinates",
      "Alert Type",
      "Severity",
      "Status",
      "Confidence",
      "Description",
      "Resolved By",
      "Resolved Time"
    ];

    const dataLines = filteredAlerts.map(alert => [
      alert._id,
      new Date(alert.createdTime || alert.createdAt).toLocaleString(),
      alert.cameraId?.name || 'N/A',
      alert.cameraId?.bankName || 'N/A',
      alert.cameraId?.branch || 'N/A',
      alert.cameraId?.address || 'N/A',
      alert.cameraId?.location ?
        `${alert.cameraId.location.latitude}, ${alert.cameraId.location.longitude}` : 'N/A',
      alert.type,
      alert.severity,
      alert.status,
      `${alert.confidence || 0}%`,
      `"${(alert.description || 'N/A').replace(/"/g, '""')}"`,
      alert.resolvedBy?.name || 'N/A',
      alert.resolvedTime ? new Date(alert.resolvedTime).toLocaleString() : 'N/A'
    ].join(","));

    const csv = [header.join(","), ...dataLines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alerts-report_${generatedAt.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCamerasCSV = () => {
    const header = [
      "Camera ID",
      "Camera Name",
      "Bank Name",
      "Branch",
      "Province",
      "District",
      "Address",
      "Latitude",
      "Longitude",
      "Status",
      "Last Available Time",
      "Stream URL",
      "Created At",
      "Updated At"
    ];

    const dataLines = filteredCameras.map(camera => [
      camera._id,
      camera.name,
      camera.bankName,
      camera.branch,
      camera.province,
      camera.district,
      `"${(camera.address || '').replace(/"/g, '""')}"`,
      camera.location?.latitude || 'N/A',
      camera.location?.longitude || 'N/A',
      camera.status,
      new Date(camera.lastAvailableTime).toLocaleString(),
      camera.streamUrl || 'N/A',
      new Date(camera.createdAt).toLocaleString(),
      new Date(camera.updatedAt).toLocaleString()
    ].join(","));

    const csv = [header.join(","), ...dataLines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cameras-report_${generatedAt.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllData = () => {
    if (activeTab === "alerts") {
      exportAlertsCSV();
    } else {
      exportCamerasCSV();
    }
  };

  // Get unique values for filters
  const uniqueProvinces = useMemo(() =>
    [...new Set(cameras.map(camera => camera.province).filter(Boolean))],
    [cameras]
  );

  const uniqueDistricts = useMemo(() =>
    [...new Set(cameras.map(camera => camera.district).filter(Boolean))],
    [cameras]
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate last active time
  const getLastActive = (lastAvailableTime) => {
    if (!lastAvailableTime) return 'Unknown';

    const now = new Date();
    const diffMs = now - new Date(lastAvailableTime);
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;

    return new Date(lastAvailableTime).toLocaleDateString();
  };

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
      {/* Header */}
      <Header title={"Reports"} />

      {/* Reports & Analytics panel */}
      <h3 className="text-xl font-semibold mb-3">Reports &amp; Analytics</h3>

      <div className="rounded-2xl bg-white shadow-lg border border-slate-200 p-5 mb-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "alerts"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Alerts Report
          </button>
          <button
            onClick={() => setActiveTab("cameras")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "cameras"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Cameras Report
          </button>
        </div>

        {/* top-right export */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            {loading && "Loading data..."}
            {error && <span className="text-red-600">Error: {error}</span>}
          </div>
          <button
            onClick={exportAllData}
            disabled={(activeTab === "alerts" && filteredAlerts.length === 0) ||
              (activeTab === "cameras" && filteredCameras.length === 0)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm px-3 py-2 shadow"
          >
            <span className="grid place-items-center">{Icon.download}</span>
            Export {activeTab === "alerts" ? "Alerts" : "Cameras"} Report
          </button>
        </div>

        {/* Filters Grid */}
        {activeTab === "alerts" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Camera</label>
              <select
                value={cameraFilter}
                onChange={(e) => setCameraFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Cameras</option>
                {cameras.map(camera => (
                  <option key={camera._id} value={camera._id}>
                    {camera.name} - {camera.bankName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Alerts</option>
                <option>Mask</option>
                <option>Helmet</option>
                <option>False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Severities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Camera Status</label>
              <select
                value={cameraStatusFilter}
                onChange={(e) => setCameraStatusFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Status</option>
                <option>Online</option>
                <option>Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
              <select
                value={cameraProvinceFilter}
                onChange={(e) => setCameraProvinceFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Provinces</option>
                {uniqueProvinces.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <select
                value={cameraDistrictFilter}
                onChange={(e) => setCameraDistrictFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Districts</option>
                {uniqueDistricts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-5">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-3 py-2 shadow"
          >
            <span className="grid place-items-center">{Icon.play}</span>
            {loading ? "Loading..." : `Generate ${activeTab === "alerts" ? "Alerts" : "Cameras"} Report`}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Data Tables */}
          {activeTab === "alerts" ? (
            /* Alerts Table */
            <div className="rounded-2xl bg-white shadow-lg border border-slate-200">
              <div className="px-5 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold">Detailed Alert Report - {period}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Generated on:{" "}
                      {generatedAt.toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" "}• Showing {filteredAlerts.length} alerts
                      {" "}• Avg Confidence: {statistics.averageConfidence}%
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div>Severity: H({statistics.highSeverity}) M({statistics.mediumSeverity}) L({statistics.lowSeverity})</div>
                    <div>Status: Open({statistics.openAlerts}) Resolved({statistics.resolvedAlerts})</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600 bg-slate-50">
                      <th className="px-4 py-3 font-semibold">Alert ID</th>
                      <th className="px-4 py-3 font-semibold">Date & Time</th>
                      <th className="px-4 py-3 font-semibold">Camera</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Severity</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Confidence</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold">Resolved Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                          {loading ? "Loading alerts..." : "No alerts found for the selected filters"}
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <tr key={alert._id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs">{alert._id}</td>
                          <td className="px-4 py-3">
                            <div>{formatDate(alert.createdTime || alert.createdAt)}</div>
                            <div className="text-xs text-slate-500">{formatTime(alert.createdTime || alert.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{alert.cameraId?.name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{alert.cameraId?.branch || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-500">
                              {alert.cameraId?.location ?
                                `${alert.cameraId.location.latitude?.toFixed(4) || 'N/A'}, ${alert.cameraId.location.longitude?.toFixed(4) || 'N/A'}` :
                                'N/A'
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${alert.type === "with mask"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                              }`}>
                              {alert.type === "with mask" ? "Mask" : "Helmet"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${alert.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : alert.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                              }`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${alert.status === "open"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                              }`}>
                              {alert.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${(alert.confidence || 0) >= 80 ? "bg-green-500" :
                                    (alert.confidence || 0) >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    }`}
                                  style={{ width: `${alert.confidence || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{alert.confidence || 0}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <div className="text-sm">{alert.description || "No description"}</div>
                          </td>
                          <td className="px-4 py-3">
                            {alert.status === "resolved" ? (
                              <div>
                                <div className="text-xs">
                                  By: {alert.resolvedBy?.name || 'System'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {alert.resolvedTime ? formatDate(alert.resolvedTime) : 'N/A'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cameras Table */
            <div className="rounded-2xl bg-white shadow-lg border border-slate-200">
              <div className="px-5 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold">Camera Inventory Report</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Generated on:{" "}
                      {generatedAt.toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" "}• Showing {filteredCameras.length} cameras
                      {" "}• Uptime: {cameraStatistics.uptimePercentage}%
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div>Online: {cameraStatistics.onlineCameras} • Offline: {cameraStatistics.offlineCameras}</div>
                    <div>Provinces: {cameraStatistics.uniqueProvinces} • Districts: {cameraStatistics.uniqueDistricts}</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600 bg-slate-50">
                      <th className="px-4 py-3 font-semibold">Camera ID</th>
                      <th className="px-4 py-3 font-semibold">Camera Name</th>
                      <th className="px-4 py-3 font-semibold">Bank & Branch</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Province/District</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Last Active</th>
                      <th className="px-4 py-3 font-semibold">Coordinates</th>
                      <th className="px-4 py-3 font-semibold">Stream URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCameras.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                          {loading ? "Loading cameras..." : "No cameras found for the selected filters"}
                        </td>
                      </tr>
                    ) : (
                      filteredCameras.map((camera) => (
                        <tr key={camera._id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs">{camera._id}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{camera.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{camera.bankName}</div>
                            <div className="text-xs text-slate-500">{camera.branch}</div>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <div className="text-sm">{camera.address}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">{camera.province}</div>
                            <div className="text-xs text-slate-500">{camera.district}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${camera.status === "online"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}>
                              {camera.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">{getLastActive(camera.lastAvailableTime)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-500">
                              {camera.location ?
                                `${camera.location.latitude?.toFixed(6) || 'N/A'}, ${camera.location.longitude?.toFixed(6) || 'N/A'}` :
                                'N/A'
                              }
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-500 truncate max-w-[200px]">
                              {camera.streamUrl || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}