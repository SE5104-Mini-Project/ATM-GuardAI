import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";

export default function LiveFeeds() {
  const cardBase = "rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Get cameraId from navigation state if available
  const selectedCameraId = location.state?.cameraId;

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/cameras');
      const result = await response.json();
      
      if (result.success) {
        setFeeds(result.data);
      } else {
        console.error('Error fetching cameras:', result.message);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const Bell = () => (
    <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );

  const LiveBadge = () => (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-white">
      Live
    </span>
  );

  const OfflineBadge = () => (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-500 text-white">
      Offline
    </span>
  );

  const FullscreenIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );

  const ExitFullscreenIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 4H4v5M20 9V4h-5M4 15v5h5M15 20h5v-5" />
    </svg>
  );

  const RecordDot = ({ active }) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-red-600 animate-pulse" : "bg-gray-500"}`} />
  );

  function CameraCard({ camera }) {
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isFs, setIsFs] = useState(false);
    const videoRef = useRef(null);
    const [streamUrl, setStreamUrl] = useState('');
    const [streamError, setStreamError] = useState(false);

    // Timer effect
    useEffect(() => {
      let interval;
      if (recording) interval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }, [recording]);

    // Set up video stream - using camera._id instead of camera.id
    useEffect(() => {
      if (camera.status === 'online') {
        setStreamUrl(`http://localhost:3001/api/liveFeeds/video_feed/${camera._id}`);
        setStreamError(false);
      }
    }, [camera._id, camera.status]);

    const formatTime = (s) => {
      const m = Math.floor(s / 60).toString().padStart(2, "0");
      const sec = (s % 60).toString().padStart(2, "0");
      return `${m}:${sec}`;
    };

    const toggleRecord = () => {
      if (recording) {
        setRecording(false);
        setSeconds(0);
      } else {
        setRecording(true);
      }
    };

    const reqFs = async (el) => {
      try {
        if (el.requestFullscreen) return await el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
      } catch {}
    };

    const exitFs = async () => {
      try {
        if (document.exitFullscreen) return await document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
      } catch {}
    };

    const handleToggleFullscreen = async () => {
      if (!isFs && videoRef.current) {
        await reqFs(videoRef.current);
      } else {
        await exitFs();
      }
    };

    useEffect(() => {
      const onChange = () => {
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        setIsFs(fsEl === videoRef.current);
      };
      document.addEventListener("fullscreenchange", onChange);
      document.addEventListener("webkitfullscreenchange", onChange);
      document.addEventListener("MSFullscreenChange", onChange);
      return () => {
        document.removeEventListener("fullscreenchange", onChange);
        document.removeEventListener("webkitfullscreenchange", onChange);
        document.removeEventListener("MSFullscreenChange", onChange);
      };
    }, []);

    const handleStreamError = () => {
      setStreamError(true);
    };

    return (
      <div className={cardBase}>
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-[#102a56] dark:bg-gray-700 text-white">
          <h4 className="font-semibold">{camera.name}</h4>
          {camera.status === 'online' ? <LiveBadge /> : <OfflineBadge />}
        </div>

        {/* Video area */}
        <div ref={videoRef} className="relative bg-[#0f1a2b] h-56 sm:h-64 rounded-b-2xl overflow-hidden">
          {camera.status === 'online' && streamUrl && !streamError ? (
            <img 
              src={streamUrl} 
              alt={`Live feed from ${camera.name}`}
              className="w-full h-full object-cover"
              onError={handleStreamError}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/70">
              <div className="text-center">
                <div className="mx-auto mb-3 text-gray-400">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1">
                  {camera.status === 'offline' ? 'Camera Offline' : 'Stream Unavailable'}
                </p>
                <p className="text-xs text-white/50">
                  {camera.status === 'offline' 
                    ? 'This camera is currently offline' 
                    : 'Unable to load video stream'}
                </p>
              </div>
            </div>
          )}

          <span className="absolute left-4 bottom-4 text-xs px-2 py-1 rounded bg-black text-white/90">
            {camera.branch || `Camera ${camera.autoIncrementId}`}
          </span>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
          <button
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label={isFs ? "Exit Fullscreen" : "Enter Fullscreen"}
            disabled={camera.status === 'offline'}
          >
            {isFs ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            {isFs ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <button
            onClick={toggleRecord}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              recording
                ? "bg-red-600 text-white hover:bg-red-700"
                : camera.status === 'online' 
                  ? "text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" 
                  : "text-gray-400 cursor-not-allowed"
            }`}
            aria-pressed={recording}
            aria-label={recording ? "Stop recording" : "Start recording"}
            disabled={camera.status === 'offline'}
          >
            <RecordDot active={recording} />
            {recording ? `Recording ${formatTime(seconds)}` : "Record"}
          </button>
        </div>
      </div>
    );
  }

  // Filter feeds if a specific camera was selected
  const displayedFeeds = selectedCameraId 
    ? feeds.filter(camera => camera._id === selectedCameraId)
    : feeds;

  // Loading state matching CameraManagement style
  if (loading) {
    return (
      <div className="px-3 sm:px-6 pt-6 pb-10 min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <Header title={"Live Feeds"} />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10 min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
      {/* Header */}
      <Header title={"Live Feeds"}/>

      {/* Section title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Live Camera Feeds</h3>

      {/* Grid of cameras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedFeeds.map((camera) => (
          <CameraCard key={camera._id} camera={camera} />
        ))}
      </div>

      {/* Empty State - matching CameraManagement style */}
      {!loading && displayedFeeds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {selectedCameraId ? "Camera not found" : "No cameras available"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {selectedCameraId 
              ? "The selected camera could not be found or is no longer available."
              : "There are no cameras configured in the system."}
          </p>
          {selectedCameraId && (
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Camera Management
            </button>
          )}
        </div>
      )}
    </div>
  );
}