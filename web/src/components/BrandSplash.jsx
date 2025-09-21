// src/components/BrandSplash.jsx
export default function BrandSplash({ subtitle = "Preparing your dashboard…" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white select-none overflow-hidden">
      <div className="relative flex items-center justify-center">
        {/* Modern glowing arc ring */}
        <div className="absolute w-[40rem] h-[40rem] rounded-full">
          <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 animate-spin-fast drop-shadow-[0_0_40px_rgba(59,130,246,0.9)]" />
          <div className="absolute inset-4 rounded-full border-8 border-transparent border-r-blue-400 animate-spin-reverse drop-shadow-[0_0_25px_rgba(96,165,250,0.7)]" />
        </div>

        {/* Glowing Eye Icon */}
        <img
          src="/logo%202.png"
          alt="ATM Guard AI Logo"
          className="w-[26rem] h-[26rem] animate-glowDeepBlue relative z-10"
          draggable="false"
        />
      </div>

      <p className="mt-12 text-xl text-gray-300">{subtitle}</p>

      <style>{`
        /* Glow on main logo */
        @keyframes glowDeepBlue {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(0, 70, 255, 0)); }
          50% { filter: drop-shadow(0 0 50px rgba(0, 70, 255, 1)); }
        }
        .animate-glowDeepBlue {
          animation: glowDeepBlue 2s ease-in-out infinite;
        }

        /* Fast spin */
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-fast {
          animation: spin-fast 3s linear infinite; /* was 10s → now much faster */
        }

        /* Counter rotation */
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 5s linear infinite; /* was 12s → faster */
        }
      `}</style>
    </div>
  );
}
