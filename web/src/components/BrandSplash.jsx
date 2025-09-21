// src/components/BrandSplash.jsx
export default function BrandSplash({ subtitle = "Preparing your dashboard…" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white select-none">
      <img
        src="/logo%202.png"
        alt="ATM Guard AI Logo"
        className="w-40 h-40 mb-6"
        draggable="false"
      />

      <h1 className="text-3xl font-semibold tracking-wide mb-2">
        <span className="text-white">ATM Guard</span>{" "}
        <span className="text-cyan-400">AI</span>
      </h1>
      <p className="mb-8 text-gray-300">{subtitle}</p>

      {/* Frame */}
      <div className="w-72 h-[22px] rounded-md border-2 border-cyan-400 p-0.5">
        {/* Track */}
        <div className="w-full h-full bg-transparent relative overflow-hidden rounded-sm">
          {/* Moving stripes */}
          <div className="absolute inset-0 animate-[barMove_1.4s_linear_infinite] [background-size:40px_100%] [background-image:repeating-linear-gradient(135deg,theme(colors.cyan.400)_0,theme(colors.cyan.400)_18px,transparent_18px,transparent_36px)]" />
          {/* Base fill */}
          <div className="absolute inset-0 bg-cyan-500/20" />
        </div>
      </div>

      <style>{`
        @keyframes barMove {
          0% { background-position: -80px 0; }
          100% { background-position: 80px 0; }
        }
      `}</style>
    </div>
  );
}
