import { createContext, useState, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CameraContext = createContext();

const API_BASE = "http://localhost:3001/api";

export function CameraProvider({ children }) {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { currentUser } = useContext(AuthContext);

    const fetchCameras = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`${API_BASE}/cameras`);
            const result = response.data;

            if (result.success) {
                setCameras(result.data);
                return { success: true, data: result.data };
            } else {
                setError("Failed to fetch cameras");
                return { success: false, message: result.message };
            }
        } catch (err) {
            setError("Error connecting to server");
            console.error("Error fetching cameras:", err);
            return { success: false, message: "Error connecting to server", error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createCamera = useCallback(async (cameraData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE}/cameras`, cameraData);
            const result = response.data;

            if (result.success) {
                setCameras(prev => [...prev, result.data]);
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: "Error creating camera", error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCamera = useCallback(async (cameraId, cameraData) => {
        try {
            setLoading(true);
            const response = await axios.put(`${API_BASE}/cameras/${cameraId}`, cameraData);
            const result = response.data;

            if (result.success) {
                setCameras(prev => prev.map(camera => 
                    camera._id === cameraId ? result.data : camera
                ));
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: "Error updating camera", error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCamera = useCallback(async (cameraId) => {
        try {
            setLoading(true);
            const response = await axios.delete(`${API_BASE}/cameras/${cameraId}`);
            const result = response.data;

            if (result.success) {
                setCameras(prev => prev.filter(camera => camera._id !== cameraId));
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: "Error deleting camera", error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const getCameraById = useCallback((cameraId) => {
        return cameras.find(camera => camera._id === cameraId);
    }, [cameras]);

    const value = {
        cameras,
        loading,
        error,
        fetchCameras,
        createCamera,
        updateCamera,
        deleteCamera,
        getCameraById,
        isAdmin: currentUser?.role === "admin",
        stats: {
            total: cameras.length,
            online: cameras.filter(c => c.status === "online").length,
            offline: cameras.filter(c => c.status === "offline").length,
        }
    };

    return (
        <CameraContext.Provider value={value}>
            {children}
        </CameraContext.Provider>
    );
}