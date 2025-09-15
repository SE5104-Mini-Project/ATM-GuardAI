import { useState } from "react";


export default function Settings() {
    const cardBase = "rounded-2xl bg-white shadow-lg p-5";
    const inputBase = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    // Reusable Bell component
    const Bell = () => (
        <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
        </svg>
    );

    // Settings State
    const [alertSettings, setAlertSettings] = useState({
        sensitivity: "medium",
        dashboardAlerts: true,
        emailNotifications: true,
        smsAlerts: false,
    });

    // Handlers 
    const handleAlertSettingChange = (key, value) => {
        setAlertSettings((prev) => ({ ...prev, [key]: value }));
    };

    // Settings
    const saveSettings = (section) => {
        console.log(`Saving ${section} settings`);
        alert(
            `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`
        );
    };


    return (
        <div className="px-3 sm:px-6 pt-6 pb-10">

            {/* --------------------- Header Section --------------------- */}
            <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between`}>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <div className="flex items-center gap-6">
                    {/* Last updated info */}
                    <span className="text-sm text-blue-700">
                        Last updated: <span className="underline">Just now</span>
                    </span>

                    {/* Notification bell */}
                    <div className="relative">
                        <Bell />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            3
                        </span>
                    </div>

                    {/* User profile info */}
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


            {/* --------------------- Section title --------------------- */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">System Settings</h3>


            {/* --------------------- Settings Grid --------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Alert Preferences Card */}
                <div className={cardBase}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">Alert Preferences</h3>

                    <div className="space-y-4">
                        {/* Alert Sensitivity */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Alert Sensitivity</label>
                            <select
                                className={` ${inputBase} bg-transparent text-gray-900`}
                                value={alertSettings.sensitivity}
                                onChange={(e) => handleAlertSettingChange("sensitivity", e.target.value)}
                            >
                                <option className="text-gray-900 font-medium" value="high">High</option>
                                <option className="text-gray-900 font-medium" value="medium">Medium (Recommended)</option>
                                <option className="text-gray-900 font-medium" value="low">Low</option>
                            </select>
                        </div>

                        {/* Notification Methods */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Methods</label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="notify-dashboard"
                                        checked={alertSettings.dashboardAlerts}
                                        onChange={(e) => handleAlertSettingChange("dashboardAlerts", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notify-dashboard" className="ml-2 block text-sm text-gray-700">
                                        Dashboard Alerts
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="notify-email"
                                        checked={alertSettings.emailNotifications}
                                        onChange={(e) => handleAlertSettingChange("emailNotifications", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notify-email" className="ml-2 block text-sm text-gray-700">
                                        Email Notifications
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="notify-sms"
                                        checked={alertSettings.smsAlerts}
                                        onChange={(e) => handleAlertSettingChange("smsAlerts", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notify-sms" className="ml-2 block text-sm text-gray-700">
                                        SMS Alerts
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => saveSettings("alert")}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}