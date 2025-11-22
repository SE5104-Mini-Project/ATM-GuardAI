import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("AuthContext currentUser:", currentUser);

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem("user");
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user) {
                    setCurrentUser(user);
                    console.log("User loaded from localStorage:", user);
                }
            }
        } catch (error) {
            console.error("Error initializing auth:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}