import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem("token");
            
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setCurrentUser(result.data.user);
                        setToken(storedToken);
                    } else {
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                } else {
                    localStorage.removeItem("token");
                    setToken(null);
                }
            } catch (error) {
                console.error('Token verification error:', error);
                localStorage.removeItem("token");
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = (userData, authToken) => {
        setCurrentUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

    const logout = () => {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem("token");
        
        fetch('http://localhost:3001/api/users/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).catch(console.error);
    };

    const value = {
        currentUser,
        setCurrentUser,
        token,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}