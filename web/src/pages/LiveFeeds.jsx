// src/pages/LiveFeeds.jsx
import { useState, useEffect, useRef } from "react";
import LogoutButton from "../components/LogoutButton";

export default function LiveFeeds() {
  const cardBase =
    "rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";

  const feeds = [
    { id: 12, name: "ATM #12 - City Branch", camLabel: "Camera 1 - ATM Area" },
    { id: 7,  name: "ATM #07 - Main Street",  camLabel: "Camera 1 - Entrance" },
    { id: 15, name: "ATM #15 - Hospital Branch", camLabel: "Camera 1 - Lobby" },
    { id: 9,  name: "ATM #09 - Shopping Mall", camLabel: "Camera 1 - ATM Area" },
  ];

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
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        active ? "bg-red-600 animate-pulse" : "bg-gray-500"
      }`}
    />
  );

  function CameraCard({ name, camLabel }) {
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isFs, setIsFs] = useState(false);
    const videoRef = useRef(null);

    // timer effect
    useEffect(() => {
      let interval;
      if (recording) interval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }, [recording]);

    // format mm:ss
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

    // Fullscreen helpers (with Safari fallbacks)
    const reqFs = async (el) => {
      try {
        if (el.requestFullscreen) return await el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen(); // Safari
        if (el.msRequestFullscreen) return el.msRequestFullscreen(); // old Edge
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

    // Keep local state in sync with browser FS changes
    useEffect(() => {
      const onChange = () => {
        const fsEl =
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement;
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
      <div className={`${cardBase}`}>
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-[#102a56] text-white">
          <h4 className="font-semibold">{name}</h4>
          <LiveBadge />
        </div>

        {/* Video area */}
        <div
          ref={videoRef}
          className="relative bg-[#0f1a2b] h-56 sm:h-64 rounded-b-2xl overflow-hidden"
        >
          <div className="absolute inset-0 grid place-items-center text-white/30 text-sm">
            Video Stream
          </div>

          <style>{`
            :fullscreen .fs-fill, :-webkit-full-screen .fs-fill { width: 100%; height: 100%; }
          `}</style>

          <span className="absolute left-4 bottom-4 text-xs px-2 py-1 rounded bg-black text-white/90">
            {camLabel}
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

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10">
      {/* Top header card (updated) */}
      <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold text-gray-900">Live Feeds</h2>
        <div className="flex items-center gap-6">
          <span className="text-sm text-blue-700">
            Last updated: <span className="underline">Just now</span>
          </span>
          <div className="relative">
            <Bell />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              3
            </span>
          </div>

          {/* Admin badge + compact icon-only Logout */}
          <LogoutButton
            showEmail={false}
            showIcon
            label="Admin"
            compact
            iconOnly
            className="px-0"
          />
        </div>
      </div>

      {/* Section title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Live Camera Feeds</h3>

      {/* Grid of cameras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {feeds.map((f) => (
          <CameraCard key={f.id} name={f.name} camLabel={f.camLabel} />
        ))}
      </div>
    </div>
  );
}
