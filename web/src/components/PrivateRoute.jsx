// src/components/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "../firebase";
import BrandSplash from "./BrandSplash";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken(true);
        
        // Verify user exists in backend database
        const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const res = await fetch(base + "/api/users/me", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          console.log("PrivateRoute: User verified:", userData);
          // Allow all authenticated users with valid backend profile
          setAuthorized(true);
        } else {
          console.error("PrivateRoute: Backend verification failed");
          setAuthorized(false);
        }
      } catch (err) {
        console.error("PrivateRoute: Error verifying user:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) {
    // Branded splash while Firebase resolves auth/claims
    return <BrandSplash subtitle="Verifying your session…" />;
  }

  return authorized ? children : <Navigate to="/login" replace />;
}
