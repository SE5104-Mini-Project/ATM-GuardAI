import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const CameraContext = createContext();

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export function CameraProvider({ children }) {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [cameraLoading, setCameraLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };


    const fetchCameras = async () => {
        setCameraLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cameras`, { headers });
            setCameras(response.data?.cameras || []);
        } catch (err) {
            console.error("Fetch cameras error:", err);
            setError(err.response?.data?.message || "Network error");
        } finally {
            setCameraLoading(false);
        }
    };


    // Fetch single camera by ID
    const fetchCamera = async (cameraId) => {
        setCameraLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cameras/${cameraId}`, { headers });
            if (response.data.success) {
                setSelectedCamera(response.data.data);
                console.log(response.data.data);
            } else {
                setError(response.data.message || "Camera not found");
            }
        } catch (err) {
            console.error("Fetch camera error:", err);
            setError(err.response?.data?.message || "Network error");
        } finally {
            setCameraLoading(false);
        }
    };

    // Create a new camera (admin)
    const addCamera = async (payload) => {
        setCameraLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/cameras/`, payload, { headers });
            if (response.data.success) {
                setCameras((prev) => [...prev, response.data.data]);
                return { success: true, camera: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Add camera error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setCameraLoading(false);
        }
    };

    // Update camera (admin)
    const updateCamera = async (cameraId, payload) => {
        setCameraLoading(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cameras/${cameraId}`, payload, { headers });
            if (response.data.success) {
                setCameras((prev) =>
                    prev.map((c) => (c._id === cameraId ? response.data.data : c))
                );
                if (selectedCamera?._id === cameraId) setSelectedCamera(response.data.data);
                return { success: true, camera: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Update camera error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setCameraLoading(false);
        }
    };

    // Update camera status (admin)
    const updateCameraStatus = async (cameraId, status) => {
        setCameraLoading(true);
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/cameras/${cameraId}/status`,
                { status },
                { headers }
            );
            if (response.data.success) {
                setCameras((prev) =>
                    prev.map((c) => (c._id === cameraId ? response.data.data : c))
                );
                if (selectedCamera?._id === cameraId) setSelectedCamera(response.data.data);
                return { success: true, camera: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Update camera status error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setCameraLoading(false);
        }
    };

    // Delete camera (admin)
    const deleteCamera = async (cameraId) => {
        setCameraLoading(true);
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/cameras/${cameraId}`, { headers });
            if (response.data.success) {
                setCameras((prev) => prev.filter((c) => c._id !== cameraId));
                if (selectedCamera?._id === cameraId) setSelectedCamera(null);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Delete camera error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setCameraLoading(false);
        }
    };

    // Fetch camera stats
    const fetchCameraStats = async () => {
        setCameraLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cameras/stats`, { headers });
            if (response.data.success) {
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Fetch camera stats error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setCameraLoading(false);
        }
    };

    const value = {
        cameras,
        selectedCamera,
        cameraLoading,
        error,
        fetchCameras,
        fetchCamera,
        addCamera,
        updateCamera,
        updateCameraStatus,
        deleteCamera,
        fetchCameraStats,
        setSelectedCamera,
        setError,
    };

    useEffect(() => {
        if (token) fetchCameras();
        else setCameraLoading(false);
    }, []);

    return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}