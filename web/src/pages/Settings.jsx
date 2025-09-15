import { useState, useEffect } from "react";

export default function Settings() {
    const cardBase = "rounded-2xl bg-white shadow-lg p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";
    const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm font-normal";

    // Add loading animation state
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setEntered(true), 40);
        return () => clearTimeout(t);
    }, []);

    // Reusable Bell component
    const Bell = () => (
        <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
        </svg>
    );

    // Alert State
    const [alertSettings, setAlertSettings] = useState({
        sensitivity: "medium",
        dashboardAlerts: true,
        emailNotifications: true,
        smsAlerts: false,
    });

    // System State
    const [systemSettings, setSystemSettings] = useState({
        retentionPeriod: "90",
        autoLogout: "60",
        videoQuality: "high"
    });

    // AI Setting State
    const [aiSettings, setAiSettings] = useState({
        confidenceThreshold: 85,
        updateFrequency: "monthly",
        autoLearning: true
    });



    // Handlers Alert Change
    const handleAlertSettingChange = (key, value) => {
        setAlertSettings((prev) => ({ ...prev, [key]: value }));
    };

    // handle System Change
    const handleSystemSettingChange = (key, value) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
    };

    // handle Ai Setting Change
    const handleAiSettingChange = (key, value) => {
        setAiSettings(prev => ({ ...prev, [key]: value }));
    };


    // Save Settings
    const saveSettings = (section) => {
        console.log(`Saving ${section} settings`);
        alert(
            `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`
        );
    };

    return (
        <div className="px-3 sm:px-6 pt-6 pb-10 text-slate-900">

            {/* --------------------- Header Section --------------------- */}
            <div className={`${cardBase} mb-6 px-5 py-4 flex items-center justify-between
                ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{ transitionDelay: "0ms" }}>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
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
            <h3 className={`text-xl font-semibold text-gray-900 mb-3 transition-all
                ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{ transitionDelay: "30ms" }}>
                System Settings
            </h3>



            {/* --------------------- Settings Grid --------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

                {/* ------------ Alert Preferences Card ------------ */}
                <div className={`${cardBase} transition-all
                    ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    style={{ transitionDelay: "60ms" }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">Alert Preferences</h3>

                    <div className="space-y-4">
                        {/* Alert Sensitivity */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Alert Sensitivity</label>
                            <select
                                className={`${inputBase} bg-transparent text-gray-900`}
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
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="notify-dashboard"
                                        checked={alertSettings.dashboardAlerts}
                                        onChange={(e) => handleAlertSettingChange("dashboardAlerts", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notify-dashboard" className="text-sm text-gray-900">
                                        Dashboard Alerts
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="notify-email"
                                        checked={alertSettings.emailNotifications}
                                        onChange={(e) => handleAlertSettingChange("emailNotifications", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notify-email" className="text-sm text-gray-900">
                                        Email Notifications
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="notify-sms"
                                        checked={alertSettings.smsAlerts}
                                        onChange={(e) => handleAlertSettingChange("smsAlerts", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notify-sms" className="text-sm text-gray-900">
                                        SMS Alerts
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => saveSettings("alert")}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>



                {/* ------------ System Configuration ------------ */}
                <div className={`${cardBase} transition-all
                    ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    style={{ transitionDelay: "90ms" }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">System Configuration</h3>

                    <div className="space-y-4">

                        {/* Data Retention Period */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Data Retention Period</label>
                            <select
                                className={inputBase}
                                value={systemSettings.retentionPeriod}
                                onChange={(e) => handleSystemSettingChange("retentionPeriod", e.target.value)}
                            >
                                <option className="text-gray-900 font-medium" value="30">30 Days</option>
                                <option className="text-gray-900 font-medium" value="60">60 Days</option>
                                <option className="text-gray-900 font-medium" value="90">90 Days (Recommended)</option>
                                <option className="text-gray-900 font-medium" value="365">1 Year</option>
                            </select>
                        </div>

                        {/* Auto Logout After */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Auto Logout After</label>
                            <select
                                className={inputBase}
                                value={systemSettings.autoLogout}
                                onChange={(e) => handleSystemSettingChange("autoLogout", e.target.value)}
                            >
                                <option className="text-gray-900 font-medium" value="15">15 minutes</option>
                                <option className="text-gray-900 font-medium" value="30">30 minutes</option>
                                <option className="text-gray-900 font-medium" value="60">1 hour (Recommended)</option>
                                <option className="text-gray-900 font-medium" value="120">2 hours</option>
                            </select>
                        </div>

                        {/* Video Quality */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Video Quality</label>
                            <select
                                className={inputBase}
                                value={systemSettings.videoQuality}
                                onChange={(e) => handleSystemSettingChange("videoQuality", e.target.value)}
                            >
                                <option className="text-gray-900 font-medium" value="low">Low (Faster Processing)</option>
                                <option className="text-gray-900 font-medium" value="medium">Medium</option>
                                <option className="text-gray-900 font-medium" value="high">High (Recommended)</option>
                            </select>
                        </div>

                        <button
                            onClick={() => saveSettings("system")}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>


                {/* ------------ AI Model Settings Card ------------ */}
                <div className={`${cardBase} transition-all
                    ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                    style={{ transitionDelay: "120ms" }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">AI Model Settings</h3>

                    <div className="space-y-4">
                        {/* Detection Confidence Threshold */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Detection Confidence Threshold: {aiSettings.confidenceThreshold}%
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="99"
                                value={aiSettings.confidenceThreshold}
                                onChange={(e) => handleAiSettingChange("confidenceThreshold", parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>50%</span>
                                <span>75%</span>
                                <span>99%</span>
                            </div>
                        </div>

                        {/* Model Update Frequency */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Model Update Frequency</label>
                            <select
                                className={inputBase}
                                value={aiSettings.updateFrequency}
                                onChange={(e) => handleAiSettingChange("updateFrequency", e.target.value)}
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly (Recommended)</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>

                        {/* Auto-Learning Mode */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Auto-Learning Mode</label>
                            <select
                                className={inputBase}
                                value={aiSettings.autoLearning ? "enabled" : "disabled"}
                                onChange={(e) => handleAiSettingChange("autoLearning", e.target.value === "enabled")}
                            >
                                <option value="enabled">Enabled (Recommended)</option>
                                <option value="disabled">Disabled</option>
                            </select>
                        </div>

                        <button
                            onClick={() => saveSettings("AI model")}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Save Model Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}