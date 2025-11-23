import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MatrixRain from "../components/MatrixRain";

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
      className="w-screen h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/opening-page.png')", // image inside /public/
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
    >
      {/* Matrix Rain Animation - More visible but still subtle */}
      <MatrixRain opacity={0.25} speed={60} />
      
      {/* Semi-transparent overlay to enhance readability */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ 
          opacity: 0.1,
          zIndex: 2
        }}
      />

      {/* Small button fixed at bottom-right */}
      <button
        onClick={() => navigate("/loading", { state: { next: "/login", delayMs: 700 } })}
        className="absolute bottom-6 right-6 px-4 py-2 text-sm font-medium bg-cyan-500 text-white rounded-lg shadow-md hover:bg-cyan-600 z-10"
      >
        Enter
      </button>
    </div>
  );
}
