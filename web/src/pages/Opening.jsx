// src/pages/Opening.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Opening() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        navigate("/loading", { state: { next: "/login", delayMs: 700 } });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div
      className="w-screen h-screen relative"
      style={{
        backgroundImage: "url('/opening-page.png')", // image inside /public/
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
    >
      {/* Small button fixed at bottom-right */}
      <button
        onClick={() => navigate("/loading", { state: { next: "/login", delayMs: 700 } })}
        className="absolute bottom-6 right-6 px-4 py-2 text-sm font-medium bg-cyan-500 text-white rounded-lg shadow-md hover:bg-cyan-600"
      >
        Enter
      </button>
    </div>
  );
}
