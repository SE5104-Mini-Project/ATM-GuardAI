import { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const UserContext = createContext();

const API_BASE = "http://localhost:3001";

export function UserProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/users`, {
        withCredentials: true,
      });

      const result = response.data;

      if (result.success) {
        setUsers(result.data.users || []);
        return { success: true, data: result.data.users || [] };
      } else {
        setError("Failed to fetch users");
        return { success: false, message: "Failed to fetch users" };
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching users:", err);
      return { success: false, message: "Error connecting to server" };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new user
  const createUser = async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/users/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const result = response.data;

      if (result.success) {
        await fetchUsers();
        setSuccess("User created successfully");
        return { success: true, data: result.data };
      } else {
        setError(result.message || "Failed to create user");
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError("Error creating user");
      console.error("Error creating user:", err);
      return { success: false, message: "Error creating user" };
    }
  };

  // Update an existing user
  const updateUser = async (userId, userData) => {
    try {
      const response = await axios.put(
        `${API_BASE}/api/users/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const result = response.data;

      if (result.success) {
        await fetchUsers();
        setSuccess("User updated successfully");
        return { success: true, data: result.data };
      } else {
        setError(result.message || "Failed to update user");
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError("Error updating user");
      console.error("Error updating user:", err);
      return { success: false, message: "Error updating user" };
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/users/${userId}`,
        {
          withCredentials: true,
        }
      );

      const result = response.data;

      if (result.success) {
        await fetchUsers();
        setSuccess("User deleted successfully");
        return { success: true };
      } else {
        setError(result.message || "Failed to delete user");
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError("Error deleting user");
      console.error("Error deleting user:", err);
      return { success: false, message: "Error deleting user" };
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(user => user._id === userId);
  };

  // Get user stats
  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === "Active").length,
      inactive: users.filter(u => u.status === "Inactive").length,
      suspended: users.filter(u => u.status === "Suspended").length,
    };
  };

  const value = {
    users,
    loading,
    error,
    success,
    isAdmin,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearMessages,
    clearError,
    clearSuccess,
    getUserById,
    getUserStats,
    setUsers,
    setLoading,
    setError,
    setSuccess,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}