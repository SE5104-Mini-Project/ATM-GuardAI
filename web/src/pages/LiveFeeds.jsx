//src/pages/LiveFeeds.jsx
export default function LiveFeeds() {
  const cardBase =
    "rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";

  const feeds = [
    { id: 12, name: "ATM #12 - City Branch", camLabel: "Camera 1 - ATM Area", status: "Live" },
    { id: 7,  name: "ATM #07 - Main Street",  camLabel: "Camera 1 - Entrance", status: "Live" },
    { id: 15, name: "ATM #15 - Hospital Branch", camLabel: "Camera 1 - Lobby", status: "Live" },
    { id: 9,  name: "ATM #09 - Shopping Mall", camLabel: "Camera 1 - ATM Area", status: "Live" },
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

  const RecordIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );

  function CameraCard({ name, camLabel }) {
    return (
      <div className={`${cardBase}`}>
        {/* card header */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-[#102a56] text-white">
          <h4 className="font-semibold">{name}</h4>
          <LiveBadge />
        </div>

        {/* video area */}
        <div className="relative bg-[#0f1a2b] h-56 sm:h-64 rounded-b-2xl">
          {/* bottom-left chip */}
          <span className="absolute left-4 bottom-4 text-xs px-2 py-1 rounded bg-black text-white/90">
            {camLabel}
          </span>
        </div>

        {/* footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
          <button className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900">
            <FullscreenIcon />
            Fullscreen
          </button>
          <button className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900">
            <RecordIcon />
            Record
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pt-6 pb-10">
      {/* top header card */}
      <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold text-gray-900">Live Feeds</h2>
        <div className="flex items-center gap-6">
          <span className="text-sm text-blue-700">Last updated: <span className="underline">Just now</span></span>
          <div className="relative">
            <Bell />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              3
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold grid place-items-center">JS</div>
            <div className="leading-tight">
              <div className="font-medium text-gray-900">John Smith</div>
              <div className="text-sm text-gray-500">Security Officer</div>
            </div>
          </div>
        </div>
      </div>

      {/* section title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Live Camera Feeds</h3>

      {/* grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {feeds.map((f) => (
          <CameraCard key={f.id} name={f.name} camLabel={f.camLabel} />
        ))}
      </div>
    </div>
  );
}
