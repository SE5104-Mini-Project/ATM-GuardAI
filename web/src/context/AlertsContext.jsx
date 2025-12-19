import { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

const AlertsContext = createContext();

const API_BASE = "http://localhost:3001/api";

export function AlertsProvider({ children }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Alerts");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [severityFilter, setSeverityFilter] = useState("All Severities");
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const fetchAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`${API_BASE}/alerts`);
            
            if (response.data.success) {
                setAlerts(response.data.data.alerts || []);
            } else {
                setError("Failed to fetch alerts");
            }
        } catch (err) {
            setError("Error connecting to server");
            console.error("Error fetching alerts:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAlert = useCallback(async (alertId, updateData) => {
        try {
            setUpdateLoading(true);
            const response = await axios.put(`${API_BASE}/alerts/${alertId}`, updateData);
            
            if (response.data.success) {
                await fetchAlerts();
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Error updating alert:", err);
            return { 
                success: false, 
                message: err.response?.data?.message || "Error updating alert" 
            };
        } finally {
            setUpdateLoading(false);
        }
    }, [fetchAlerts]);

    const deleteAlert = useCallback(async (alertId) => {
        try {
            const response = await axios.delete(`${API_BASE}/alerts/${alertId}`);
            
            if (response.data.success) {
                await fetchAlerts();
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Error deleting alert:", err);
            return { 
                success: false, 
                message: err.response?.data?.message || "Error deleting alert" 
            };
        }
    }, [fetchAlerts]);

    const resolveAlert = useCallback(async (alert, currentUser) => {
        const updateData = {
            status: "resolved",
            resolvedBy: currentUser?._id || null
        };

        return await updateAlert(alert._id, updateData);
    }, [updateAlert]);

    const clearFilters = useCallback(() => {
        setStatusFilter("All Alerts");
        setTypeFilter("All Types");
        setSeverityFilter("All Severities");
    }, []);

    const clearError = useCallback(() => {
        setError("");
    }, []);

    const value = {
        alerts,
        setAlerts,
        loading,
        setLoading,
        error,
        setError,
        clearError,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        severityFilter,
        setSeverityFilter,
        selectedAlert,
        setSelectedAlert,
        updateLoading,
        fetchAlerts,
        updateAlert,
        deleteAlert,
        resolveAlert,
        clearFilters
    };

    return (
        <AlertsContext.Provider value={value}>
            {children}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error("useAlerts must be used within an AlertsProvider");
    }
    return context;
}