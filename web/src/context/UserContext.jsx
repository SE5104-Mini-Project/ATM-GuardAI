import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const UserContext = createContext();

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch all users
    const fetchUsers = async (skip = 0, limit = 100) => {
        setUserLoading(true);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/users?skip=${skip}&limit=${limit}`,
                { headers }
            );
            if (response.data.success) {
                setUsers(response.data.data.users);
            } else {
                setError(response.data.message || "Failed to fetch users");
            }
        } catch (err) {
            console.error("Fetch users error:", err);
            setError(err.response?.data?.message || "Network error");
        } finally {
            setUserLoading(false);
        }
    };

    // Fetch single user by ID
    const fetchUser = async (userId) => {
        setUserLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, { headers });
            if (response.data.success) {
                setSelectedUser(response.data.data.user);
            } else {
                setError(response.data.message || "User not found");
            }
        } catch (err) {
            console.error("Fetch user error:", err);
            setError(err.response?.data?.message || "Network error");
        } finally {
            setUserLoading(false);
        }
    };

    // Update user
    const updateUser = async (userId, payload) => {
        setUserLoading(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, payload, { headers });
            if (response.data.success) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? response.data.data.user : u))
                );
                if (selectedUser?.id === userId) setSelectedUser(response.data.data.user);
                return { success: true, user: response.data.data.user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Update user error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setUserLoading(false);
        }
    };

    // Delete user
    const deleteUser = async (userId) => {
        setUserLoading(true);
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, { headers });
            if (response.data.success) {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                if (selectedUser?.id === userId) setSelectedUser(null);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Delete user error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setUserLoading(false);
        }
    };

    // Add new user
    const addUser = async (payload) => {
        setUserLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/register`, payload, { headers });
            if (response.data.success) {
                setUsers((prev) => [...prev, response.data.data.user]);
                return { success: true, user: response.data.data.user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Add user error:", err);
            return { success: false, message: err.response?.data?.message || "Network error" };
        } finally {
            setUserLoading(false);
        }
    };

    const value = {
        users,
        selectedUser,
        userLoading,
        error,
        fetchUsers,
        fetchUser,
        updateUser,
        deleteUser,
        addUser,
        setSelectedUser,
        setError,
    };

    useEffect(() => {
        if (token) fetchUsers();
        else setUserLoading(false);
    }, [token]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}