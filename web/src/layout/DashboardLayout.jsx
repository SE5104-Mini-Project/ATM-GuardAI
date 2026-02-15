// DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-64 pr-2 sm:pr-4">
        <Outlet />
      </main>
    </div>
  );
}
