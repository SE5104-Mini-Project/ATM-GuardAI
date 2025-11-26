import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ATMLocations() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedATM, setSelectedATM] = useState(null);

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

  /* ---------- Fetch cameras from API ---------- */
  const API_BASE = "http://localhost:3001/api";

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/cameras`);
        const result = await response.json();

        if (result.success) {
          setCameras(result.data);
        }
      } catch (err) {
        console.error("Error fetching cameras:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  /* ---------- Filters ---------- */
  const [statusFilterTop, setStatusFilterTop] = useState("All ATMs");
  const [statusFilterMap, setStatusFilterMap] = useState("All ATMs");
  const [regionFilter, setRegionFilter] = useState("All Regions");

  const toStatus = (x) => (x === "All ATMs" ? "all" : x.toLowerCase());

  const effectiveStatus = useMemo(() => {
    const a = toStatus(statusFilterTop);
    const b = toStatus(statusFilterMap);
    if (a === "all" && b === "all") return "all";
    if (a === "all") return b;
    if (b === "all") return a;
    return a === b ? a : "__none__";
  }, [statusFilterTop, statusFilterMap]);

  // Helper function to format last active time
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

  // Convert cameras to locations format
  const locations = useMemo(() => {
    return cameras.map((camera) => ({
      id: camera._id,
      name: `${camera.name} - ${camera.branch}`,
      status: camera.status,
      region: camera.province || "Unknown",
      district: camera.district || "Unknown",
      address: camera.address || "No address provided",
      cameras: 1,
      bankName: camera.bankName,
      branch: camera.branch,
      latitude: camera.location?.latitude,
      longitude: camera.location?.longitude,
      lastAlert: formatLastActive(camera.lastAvailableTime),
    }));
  }, [cameras]);

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

  // Get unique regions from cameras
  const availableRegions = useMemo(() => {
    const regions = [...new Set(locations.map(loc => loc.region))].filter(Boolean);
    return regions.sort();
  }, [locations]);

  // Calculate map center and zoom based on ATM locations
  const mapConfig = useMemo(() => {
    const validLocations = filtered.filter(loc => loc.latitude && loc.longitude);
    
    if (validLocations.length === 0) {
      // Default to Sri Lanka center
      return { centerLat: 7.8731, centerLng: 80.7718, zoom: 8 };
    }

    const lats = validLocations.map(loc => parseFloat(loc.latitude));
    const lngs = validLocations.map(loc => parseFloat(loc.longitude));
    
    // Calculate bounds to include all ATMs
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate scale to fit all points
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    // Add padding (20%) and ensure all points fit in the viewBox
    const scale = Math.min(350 / (lngRange * 1.4 || 1), 200 / (latRange * 1.4 || 1));

    console.log('Map config:', { 
      centerLat, centerLng, scale,
      bounds: { minLat, maxLat, minLng, maxLng },
      totalLocations: validLocations.length 
    });

    return { centerLat, centerLng, scale };
  }, [filtered]);


  const statusPill = (status) => {
    const map = { alert: "bg-red-600 text-white", online: "bg-emerald-600 text-white", offline: "bg-slate-400 text-white" };
    const label = status === "alert" ? "Alert" : status === "online" ? "Online" : "Offline";
    return <span className={`px-2 py-0.5 text-xs rounded-full ${map[status]}`}>{label}</span>;
  };

  // Mock Map Component with real Sri Lanka SVG map
  function MockMap({ locations, selected, onSelectATM }) {
    const { centerLat, centerLng, scale } = mapConfig;
    
    // Convert lat/lng to SVG coordinates matching the actual Sri Lanka map
    // Based on the lk.svg coordinate system analysis:
    // The SVG map uses a 1000x1000 viewBox
    // Real Sri Lanka coordinates need to be mapped accurately
    const latLngToSVG = (lat, lng) => {
      const validLat = parseFloat(lat);
      const validLng = parseFloat(lng);
      
      // Calibrated mapping based on actual Sri Lanka geography
      // Reference points from the map:
      // Jaffna (9.66°N, 80.02°E) -> approx (377, 81) in SVG
      // Colombo (6.93°N, 79.85°E) -> approx (310, 740) in SVG
      // Trincomalee (8.58°N, 81.23°E) -> approx (567, 325) in SVG
      
      // Calculate using proper mercator-like projection
      const latMin = 5.9;    // Southern tip
      const latMax = 9.9;    // Northern tip (Jaffna)
      const lngMin = 79.52;  // Western edge
      const lngMax = 81.88;  // Eastern edge
      
      // SVG coordinate ranges in the actual map
      const svgXMin = 250;   // Left edge of land
      const svgXMax = 750;   // Right edge of land
      const svgYMin = 30;    // Top (Jaffna)
      const svgYMax = 980;   // Bottom (Matara/Hambantota)
      
      // Linear mapping with proper scaling
      const x = svgXMin + ((validLng - lngMin) / (lngMax - lngMin)) * (svgXMax - svgXMin);
      const y = svgYMin + ((latMax - validLat) / (latMax - latMin)) * (svgYMax - svgYMin);
      
      return { x, y };
    };

    // Debug: log locations being rendered
    console.log('Map rendering locations:', locations.length);
    locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        const coords = latLngToSVG(loc.latitude, loc.longitude);
        console.log(`${loc.name}: (${loc.latitude}, ${loc.longitude}) -> SVG (${coords.x.toFixed(1)}, ${coords.y.toFixed(1)})`);
      } else {
        console.log(`${loc.name}: Missing coordinates`);
      }
    });

    return (
      <div className="relative w-full h-full bg-gradient-to-b from-blue-100 to-blue-50">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 1000 1000" 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="landShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Sri Lanka Map from lk.svg */}
          <g filter="url(#landShadow)">
            <use href="/lk.svg#features" />
          </g>

          {/* ATM Markers */}
          {locations.map((loc) => {
            if (!loc.latitude || !loc.longitude) {
              console.warn(`Skipping ${loc.name}: no coordinates`);
              return null;
            }
            
            const { x, y } = latLngToSVG(loc.latitude, loc.longitude);
            
            // Log if markers are out of bounds
            if (x < 0 || x > 1000 || y < 0 || y > 1000) {
              console.warn(`${loc.name} is out of visible bounds: (${x.toFixed(1)}, ${y.toFixed(1)})`);
            }
            
            const isSelected = selected?.id === loc.id;
            const markerColor = 
              loc.status === 'online' ? '#10b981' : 
              loc.status === 'offline' ? '#6b7280' : 
              '#ef4444';
            
            return (
              <g 
                key={loc.id} 
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectATM(loc)}
                className="cursor-pointer"
                style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
              >
                {/* Marker shadow */}
                <ellipse cx="0" cy="2" rx="10" ry="4" fill="black" opacity="0.2"/>
                
                {/* Marker pin */}
                <path
                  d="M0,-25 C-7,-25 -12.5,-19.5 -12.5,-12.5 C-12.5,-4 0,0 0,0 S12.5,-4 12.5,-12.5 C12.5,-19.5 7,-25 0,-25 Z"
                  fill={markerColor}
                  stroke="white"
                  strokeWidth="2.5"
                  opacity={isSelected ? 1 : 0.9}
                  style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}
                />
                {/* Center dot */}
                <circle cx="0" cy="-12.5" r="4" fill="white" />
                
                {/* Label on hover */}
                {isSelected && (
                  <>
                    <rect x="-75" y="-55" width="150" height="25" rx="4" fill="white" stroke={markerColor} strokeWidth="2" opacity="0.95"/>
                    <text x="0" y="-37" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1f2937">
                      {loc.branch}
                    </text>
                  </>
                )}
                
                {/* Pulse effect for selected */}
                {isSelected && (
                  <circle cx="0" cy="0" r="20" fill={markerColor} opacity="0.3">
                    <animate attributeName="r" from="20" to="35" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  function LocationCard({ loc }) {
    return (
      <div className="rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-[#102a56] text-white">
          <h4 className="font-semibold">{loc.name}</h4>
          {statusPill(loc.status)}
        </div>

        <div className="px-5 py-4">
          <p className="text-sm font-medium text-slate-700 mb-1">{loc.bankName}</p>
          <div className="text-sm text-slate-800">{loc.address}</div>
          <div className="mt-2 text-xs text-slate-600">
            <span className="font-medium">District:</span> {loc.district} | <span className="font-medium">Province:</span> {loc.region}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">{Icon.cam} {loc.cameras} Camera</span>
            <span className="inline-flex items-center gap-2">{Icon.clock} {loc.lastAlert}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
          {/* ⤵️ Show Loading then go to /dashboard/live-feeds */}
          <button
            onClick={() =>
              navigate("/loading", {
                state: { to: "/dashboard/live-feeds", delayMs: 900, cameraId: loc.id }
              })
            }
            disabled={loc.status === "offline"}
            className={`inline-flex items-center gap-2 ${
              loc.status === "offline" 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-blue-700 hover:text-blue-900"
            }`}
          >
            {Icon.live} View Live
          </button>

          {/* ⤵️ Show Loading then go to /dashboard/reports (include context if you want) */}
          <button
            onClick={() =>
              navigate("/loading", {
                state: { to: "/dashboard/reports", delayMs: 900, from: "atm-locations", atmId: loc.id }
              })
            }
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
      <Header title={"ATM Locations"} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ATM locations...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Section title + top filter */}
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-xl font-semibold">ATM Locations</h3>
            <select
              value={statusFilterTop}
              onChange={(e) => setStatusFilterTop(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All ATMs</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          {/* Map with controls */}
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden min-h-[420px]">
            <MockMap 
              locations={filtered} 
              selected={selectedATM}
              onSelectATM={setSelectedATM}
            />

            {/* Map Controls Panel */}
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
                    {availableRegions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </label>

                {/* Legend */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Legend</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      <span>Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Alert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected ATM Info Panel */}
            {selectedATM && (
              <div className="absolute left-4 bottom-4 w-72 rounded-xl bg-white shadow-xl border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{selectedATM.name}</h4>
                  <button 
                    onClick={() => setSelectedATM(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    {statusPill(selectedATM.status)}
                  </div>
                  <div><span className="font-semibold">Bank:</span> {selectedATM.bankName}</div>
                  <div><span className="font-semibold">Branch:</span> {selectedATM.branch}</div>
                  <div><span className="font-semibold">Address:</span> {selectedATM.address}</div>
                  <div><span className="font-semibold">District:</span> {selectedATM.district}</div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => navigate("/loading", {
                        state: { to: "/dashboard/live-feeds", delayMs: 900, cameraId: selectedATM.id }
                      })}
                      disabled={selectedATM.status === "offline"}
                      className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                        selectedATM.status === "offline"
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      View Live
                    </button>
                    <button
                      onClick={() => navigate("/loading", {
                        state: { to: "/dashboard/reports", delayMs: 900, from: "atm-locations", atmId: selectedATM.id }
                      })}
                      className="flex-1 px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-medium hover:bg-slate-700"
                    >
                      History
                    </button>
                  </div>
                </div>
              </div>
            )}
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

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {Icon.mapPin}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ATMs found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters</p>
              <button
                onClick={() => {
                  setStatusFilterTop("All ATMs");
                  setStatusFilterMap("All ATMs");
                  setRegionFilter("All Regions");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}