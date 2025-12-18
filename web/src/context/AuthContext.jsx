import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE = "http://localhost:3001";

export function AuthProvider({ children }) {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    const clearAuth = useCallback(() => {
        setCurrentUser(null);
        setAuthError("");
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setAuthError("");

            const response = await axios.post(
                `${API_BASE}/api/users/login`,
                { email, password },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                const { user } = response.data.data;
                setCurrentUser(user);
                return { success: true, user };
            }

            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "Network error. Please try again.";
            if (error.response) {
                errorMessage = error.response.data.message || "Login failed.";
            }

            setAuthError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, []);

    const verifyAuth = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/profile`, {
                credentials: "include",
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setCurrentUser(result.data.user);
                    return true;
                }
            }

            clearAuth();
            return false;
        } catch (error) {
            console.error("Auth verification error:", error);
            clearAuth();
            return false;
        }
    }, [clearAuth]);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE}/api/users/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout API call failed:", error);
        } finally {
            clearAuth();
            navigate("/login");
        }
    }, [clearAuth, navigate]);

    useEffect(() => {
        verifyAuth().finally(() => {
            setLoading(false);
        });
    }, [verifyAuth]);

    const value = {
        currentUser,
        setCurrentUser,
        login,
        logout,
        loading,
        verifyAuth,
        authError,
        clearAuthError: () => setAuthError(""),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}