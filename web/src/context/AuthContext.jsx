import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearAuth = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const verifyAuth = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/users/profile', {
                credentials: 'include' 
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
            console.error('Auth verification error:', error);
            clearAuth();
            return false;
        }
    }, [clearAuth]);

    useEffect(() => {
        verifyAuth().finally(() => {
            setLoading(false);
        });
    }, [verifyAuth]);

    const login = (userData) => {
        setCurrentUser(userData);
    };

    const logout = useCallback(async () => {
        try {
            await fetch('http://localhost:3001/api/users/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            clearAuth();
        }
    }, [clearAuth]);

    const updateUser = (userData) => {
        setCurrentUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        currentUser,
        setCurrentUser: updateUser,
        login,
        logout,
        loading,
        verifyAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}