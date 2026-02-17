import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const clearAuth = () => {
        setCurrentUser(null);
        Cookies.remove("token");
    };

    // Login method
    const login = async (email, password) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/users/login`,
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                const { user, token } = response.data.data;
                setCurrentUser(user);
                Cookies.set("token", token, { expires: 7 });
                navigate("/dashboard");
                return { success: true, user };
            } else {
                return { success: false, message: response.data.message || "Login failed." };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: error.response?.data?.message || "Network error." };
        }
    };

    // Register method
    const register = async (name, email, password, role = "user") => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/users/register`,
                { name, email, password, role },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                const { user, token } = response.data.data;
                setCurrentUser(user);
                Cookies.set("token", token, { expires: 7 });
                navigate("/dashboard");
                return { success: true, user };
            } else {
                return { success: false, message: response.data.message || "Registration failed." };
            }
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: error.response?.data?.message || "Network error." };
        }
    };

    // Fetch current user
    const fetchCurrentUser = async () => {
        const token = Cookies.get("token");
        if (!token) {
            setAuthLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setCurrentUser(response.data.data.user);
            } else {
                clearAuth();
            }
        } catch (err) {
            console.error("Failed to fetch current user:", err);
            clearAuth();
        } finally {
            setAuthLoading(false);
        }
    };

    // Logout method
    const logout = () => {
        clearAuth();
        navigate("/login");
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const value = {
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
        authLoading,
        clearAuth,
        fetchCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}