import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";

export default function LiveFeeds() {
  const cardBase = "rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
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

    // Timer effect
    useEffect(() => {
      let interval;
      if (recording) interval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }, [recording]);

    // Set up video stream - using camera._id instead of camera.id
    useEffect(() => {
      setStreamUrl(`http://localhost:3001/api/liveFeeds/video_feed/${camera._id}`);
    }, [camera._id]);

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

    return (
      <div className={cardBase}>
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-[#102a56] text-white">
          <h4 className="font-semibold">{camera.name}</h4>
          {camera.status === 'online' ? <LiveBadge /> : <OfflineBadge />}
        </div>

        {/* Video area */}
        <div ref={videoRef} className="relative bg-[#0f1a2b] h-56 sm:h-64 rounded-b-2xl overflow-hidden">
          {streamUrl ? (
            <img 
              src={streamUrl} 
              alt={`Live feed from ${camera.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load video stream');
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/30 text-sm">
              Video Stream Loading...
            </div>
          )}

          <span className="absolute left-4 bottom-4 text-xs px-2 py-1 rounded bg-black text-white/90">
            {camera.branch || `Camera ${camera.autoIncrementId}`}
          </span>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
          <button
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900"
            aria-label={isFs ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFs ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            {isFs ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <button
            onClick={toggleRecord}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              recording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-blue-700 hover:text-blue-900"
            }`}
            aria-pressed={recording}
            aria-label={recording ? "Stop recording" : "Start recording"}
          >
            <RecordDot active={recording} />
            {recording ? `Recording ${formatTime(seconds)}` : "Record"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-3 sm:px-6 pt-6 pb-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading cameras...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10">
      {/* header */}
      <Header title={"Live Feeds"}/>

      {/* Section title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Live Camera Feeds</h3>

      {/* Grid of cameras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {feeds.map((camera) => (
          <CameraCard key={camera._id} camera={camera} />
        ))}
      </div>

    </div>
  );
}