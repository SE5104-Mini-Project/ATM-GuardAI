export default function Users() {
    const cardBase = "rounded-2xl bg-white shadow-lg p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";

    // Bell component
    const Bell = () => (
        <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
        </svg>
    );

    return (
        <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">

            {/* --------------------- Header Section --------------------- */}
            <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-blue-700">
                        Total Users: <span className="font-semibold">3</span>
                    </span>

                    <div className="relative">
                        <Bell />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            3
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold grid place-items-center">
                            JS
                        </div>
                        <div className="leading-tight">
                            <div className="font-medium text-gray-900">John Smith</div>
                            <div className="text-sm text-gray-500">Security Officer</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}