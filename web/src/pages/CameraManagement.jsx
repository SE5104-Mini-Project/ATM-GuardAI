import { useState, useMemo, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

export default function CameraManagement() {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [showAddCamera, setShowAddCamera] = useState(false);
    const [showEditCamera, setShowEditCamera] = useState(false);
    const [editingCamera, setEditingCamera] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newCamera, setNewCamera] = useState({
        name: "",
        bankName: "",
        district: "",
        province: "",
        branch: "",
        latitude: "",
        longitude: "",
        address: "",
        status: "online",
        streamUrl: ""
    });

    const isAdmin = currentUser?.role === "admin";

    /* ---------- Icons ---------- */
    const Icon = {
        camera: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
            </svg>
        ),
        online: (
            <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        offline: (
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6m0-6l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        eye: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
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
        add: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14m-7-7h14" />
            </svg>
        ),
        close: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
            </svg>
        ),
        edit: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        ),
        delete: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        )
    };

    /* ---------- API Functions ---------- */
    const API_BASE = "http://localhost:3001/api";

    const fetchCameras = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/cameras`);
            const result = await response.json();

            if (result.success) {
                setCameras(result.data);
            } else {
                setError("Failed to fetch cameras");
            }
        } catch (err) {
            setError("Error connecting to server");
            console.error("Error fetching cameras:", err);
        } finally {
            setLoading(false);
        }
    };

    const createCamera = async (cameraData) => {
        try {
            const response = await fetch(`${API_BASE}/cameras`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cameraData),
            });
            const result = await response.json();

            if (result.success) {
                await fetchCameras();
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: "Error creating camera", err };
        }
    };

    const updateCamera = async (cameraId, cameraData) => {
        try {
            const response = await fetch(`${API_BASE}/cameras/${cameraId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cameraData),
            });
            const result = await response.json();

            if (result.success) {
                await fetchCameras();
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: "Error updating camera", err };
        }
    };

    const deleteCamera = async (cameraId) => {
        try {
            const response = await fetch(`${API_BASE}/cameras/${cameraId}`, {
                method: "DELETE",
            });
            const result = await response.json();

            if (result.success) {
                await fetchCameras();
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: "Error deleting camera", err };
        }
    };

    /* ---------- Effects ---------- */
    useEffect(() => {
        fetchCameras();
    }, []);

    /* ---------- Filters ---------- */
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCameras = useMemo(() => {
        return cameras.filter(camera => {
            const matchesStatus = statusFilter === "all" || camera.status === statusFilter;
            const matchesSearch =
                camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.address?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [cameras, statusFilter, searchQuery]);

    const stats = {
        total: cameras.length,
        online: cameras.filter(c => c.status === "online").length,
        offline: cameras.filter(c => c.status === "offline").length,
    };

    const StatusBadge = ({ status }) => {
        const config = {
            online: { class: "bg-emerald-100 text-emerald-800 border-emerald-200", text: "Online" },
            offline: { class: "bg-red-100 text-red-800 border-red-200", text: "Offline" }
        };

        return (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config[status]?.class || config.offline.class}`}>
                {status === "online" ? Icon.online : Icon.offline}
                {config[status]?.text || "Offline"}
            </div>
        );
    };

    /* ---------- Camera Management Functions ---------- */
    const handleAddCamera = async () => {
        if (!newCamera.name || !newCamera.bankName || !newCamera.branch) {
            alert("Please fill in all required fields");
            return;
        }

        const result = await createCamera(newCamera);

        if (result.success) {
            setShowAddCamera(false);
            setNewCamera({
                name: "",
                bankName: "",
                district: "",
                province: "",
                branch: "",
                latitude: "",
                longitude: "",
                address: "",
                status: "online",
                streamUrl: ""
            });
        } else {
            alert(result.message);
        }
    };

    const handleEditCamera = async () => {
        if (!editingCamera.name || !editingCamera.bankName || !editingCamera.branch) {
            alert("Please fill in all required fields");
            return;
        }

        const result = await updateCamera(editingCamera._id, editingCamera);

        if (result.success) {
            setShowEditCamera(false);
            setEditingCamera(null);
        } else {
            alert(result.message);
        }
    };

    const handleDeleteCamera = async (cameraId) => {
        if (window.confirm("Are you sure you want to delete this camera?")) {
            const result = await deleteCamera(cameraId);

            if (!result.success) {
                alert(result.message);
            }
        }
    };

    const handleInputChange = (field, value) => {
        setNewCamera(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditInputChange = (field, value) => {
        setEditingCamera(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const openEditModal = (camera) => {
        setEditingCamera({
            _id: camera._id,
            name: camera.name,
            bankName: camera.bankName,
            district: camera.district,
            province: camera.province,
            branch: camera.branch,
            latitude: camera.location?.latitude || "",
            longitude: camera.location?.longitude || "",
            address: camera.address,
            status: camera.status,
            streamUrl: camera.streamUrl || ""
        });
        setShowEditCamera(true);
    };

    const formatLastActive = (lastAvailableTime) => {
        if (!lastAvailableTime) return "Never";

        const now = new Date();
        const lastActive = new Date(lastAvailableTime);
        const diffMs = now - lastActive;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="px-3 sm:px-6 pt-6 pb-10 min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
            {/* Header */}
            <Header title={"Camera Management"} />

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Cameras", value: stats.total, color: "bg-blue-50 text-blue-600 ring-blue-200" },
                    { label: "Online", value: stats.online, color: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
                    { label: "Offline", value: stats.offline, color: "bg-red-50 text-red-600 ring-red-200" },
                ].map((stat, index) => (
                    <div key={index} className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-5 flex items-center gap-4 ring-1 ring-gray-200 dark:ring-gray-700">
                        <div className={`rounded-xl p-3 ring-1 ${stat.color}`}>
                            {Icon.camera}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-4 mb-6 ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none">
                            <input
                                type="text"
                                placeholder="Search cameras..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 pl-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddCamera(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                {Icon.add}
                                Add Camera
                            </button>
                        )}
                        <button
                            onClick={fetchCameras}
                            disabled={loading}
                            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {Icon.refresh}
                            {loading ? "Loading..." : "Refresh"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading cameras...</p>
                </div>
            )}

            {/* Cameras Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredCameras.map(camera => (
                        <div key={camera._id} className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                            {/* Camera Header */}
                            <div className="bg-[#102a56] dark:bg-gray-700 text-white px-5 py-4 flex items-center justify-between">
                                <h4 className="font-semibold text-lg">{camera.name}</h4>
                                <StatusBadge status={camera.status} />
                            </div>

                            {/* Camera Details */}
                            <div className="px-5 py-4">
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{camera._id} - {camera.bankName} </p>
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{camera.branch}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{camera.address}</p>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span>District:</span>
                                        <span className="font-medium">{camera.district}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>streamUrl:</span>
                                        <span className="font-medium">{camera.streamUrl}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Province:</span>
                                        <span className="font-medium">{camera.province}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Last Active:</span>
                                        <span className="font-medium">{formatLastActive(camera.lastAvailableTime)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                                <button
                                    onClick={() => navigate("/loading", {
                                        state: { to: "/dashboard/live-feeds", delayMs: 700, cameraId: camera._id }
                                    })}
                                    disabled={camera.status === "offline"}
                                    className={`inline-flex items-center gap-2 ${camera.status === "offline"
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                        }`}
                                >
                                    {Icon.eye}
                                    <span className="font-medium">View Live</span>
                                </button>

                                {isAdmin && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openEditModal(camera)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                                        >
                                            {Icon.edit}
                                            <span className="font-medium">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCamera(camera._id)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 inline-flex items-center gap-1"
                                        >
                                            {Icon.delete}
                                            <span className="font-medium">Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredCameras.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cameras found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Add Camera Modal */}
            {showAddCamera && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#102a56] dark:bg-gray-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Add New Camera</h3>
                            <button
                                onClick={() => setShowAddCamera(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                {Icon.close}
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Camera Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Front Entrance Camera"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Bank Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.bankName}
                                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., ABC Bank"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Branch *
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.branch}
                                    onChange={(e) => handleInputChange("branch", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Main Branch"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    District
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.district}
                                    onChange={(e) => handleInputChange("district", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Colombo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Province
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.province}
                                    onChange={(e) => handleInputChange("province", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Western Province"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 123 Main Street"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newCamera.latitude}
                                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 6.9271"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newCamera.longitude}
                                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 79.8612"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={newCamera.status}
                                    onChange={(e) => handleInputChange("status", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Stream URL
                                </label>
                                <input
                                    type="text"
                                    value={newCamera.streamUrl}
                                    onChange={(e) => handleInputChange("streamUrl", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., http://192.168.1.10:8080/stream"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowAddCamera(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCamera}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Camera Modal */}
            {showEditCamera && editingCamera && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[#102a56] dark:bg-gray-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Edit Camera</h3>
                            <button
                                onClick={() => setShowEditCamera(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                {Icon.close}
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Camera Name *
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.name}
                                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Front Entrance Camera"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Bank Name *
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.bankName}
                                    onChange={(e) => handleEditInputChange("bankName", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., ABC Bank"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Branch *
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.branch}
                                    onChange={(e) => handleEditInputChange("branch", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Main Branch"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    District
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.district}
                                    onChange={(e) => handleEditInputChange("district", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Colombo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Province
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.province}
                                    onChange={(e) => handleEditInputChange("province", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Western Province"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.address}
                                    onChange={(e) => handleEditInputChange("address", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 123 Main Street"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editingCamera.latitude}
                                    onChange={(e) => handleEditInputChange("latitude", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 6.9271"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editingCamera.longitude}
                                    onChange={(e) => handleEditInputChange("longitude", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 79.8612"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editingCamera.status}
                                    onChange={(e) => handleEditInputChange("status", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Stream URL
                                </label>
                                <input
                                    type="text"
                                    value={editingCamera.streamUrl}
                                    onChange={(e) => handleEditInputChange("streamUrl", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., http://192.168.1.10:8080/stream"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowEditCamera(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditCamera}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Update Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}