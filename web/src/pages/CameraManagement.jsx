import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function CameraManagement() {
    const navigate = useNavigate();

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
        settings: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
        )
    };

    /* ---------- Camera Data ---------- */
    const cameras = [
        {
            id: 1,
            name: "Front Entrance",
            status: "online",
            location: "ATM #12 - City Branch",
            lastActive: "2 min ago",
        },
        {
            id: 2,
            name: "Cash Area",
            status: "online",
            location: "ATM #12 - City Branch",
            lastActive: "5 min ago",
        },
        {
            id: 3,
            name: "Lobby Overview",
            status: "offline",
            location: "ATM #07 - Main Street",
            lastActive: "2 hours ago",
        },
        {
            id: 4,
            name: "Vestibule",
            status: "online",
            location: "ATM #15 - Hospital Branch",
            lastActive: "Just now",
        },
        {
            id: 5,
            name: "Street View",
            status: "online",
            location: "ATM #15 - Hospital Branch",
            lastActive: "1 min ago",
        },
        {
            id: 6,
            name: "Rear Exit",
            status: "offline",
            location: "ATM #09 - Shopping Mall",
            lastActive: "3 hours ago",
        }
    ];

    /* ---------- Filters ---------- */
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCameras = useMemo(() => {
        return cameras.filter(camera => {
            const matchesStatus = statusFilter === "all" || camera.status === statusFilter;
            const matchesLocation = locationFilter === "all" || camera.location === locationFilter;
            const matchesSearch = camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.model.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesLocation && matchesSearch;
        });
    }, [cameras, statusFilter, locationFilter, searchQuery]);

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
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config[status].class}`}>
                {status === "online" ? Icon.online : Icon.offline}
                {config[status].text}
            </div>
        );
    };


    return (
        <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">
            {/* Header */}
            <Header title={"Camera Management"} />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Cameras", value: stats.total, color: "bg-blue-50 text-blue-600 ring-blue-200" },
                    { label: "Online", value: stats.online, color: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
                    { label: "Offline", value: stats.offline, color: "bg-red-50 text-red-600 ring-red-200" },
                ].map((stat, index) => (
                    <div key={index} className="rounded-2xl bg-white shadow-lg p-5 flex items-center gap-4 ring-1 ring-gray-200">
                        <div className={`rounded-xl p-3 ring-1 ${stat.color}`}>
                            {Icon.camera}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="rounded-2xl bg-white shadow-lg p-4 mb-6 ring-1 ring-gray-200">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none">
                            <input
                                type="text"
                                placeholder="Search cameras..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <button
                            onClick={() => navigate("/loading", { state: { to: "/dashboard/camera-setup", delayMs: 700 } })}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {Icon.add}
                            Add Camera
                        </button>
                        <button className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            {Icon.refresh}
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Cameras Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCameras.map(camera => (
                    <div key={camera.id} className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 overflow-hidden">
                        {/* Camera Header */}
                        <div className="bg-[#102a56] text-white px-5 py-4 flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{camera.name}</h4>
                            <StatusBadge status={camera.status} />
                        </div>

                        {/* Camera Details */}
                        <div className="px-5 py-4">
                            <p className="text-gray-900 font-medium mb-2">{camera.location}</p>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Last Active:</span>
                                    <span className="font-medium">{camera.lastActive}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
                            <button
                                onClick={() => navigate("/loading", {
                                    state: { to: "/dashboard/live-feeds", delayMs: 700, cameraId: camera.id }
                                })}
                                disabled={camera.status === "offline"}
                                className={`inline-flex items-center gap-2 ${camera.status === "offline"
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-700 hover:text-blue-900"
                                    }`}
                            >
                                {Icon.eye}
                                <span className="font-medium">View Live</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCameras.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cameras found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                            setLocationFilter("all");
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}