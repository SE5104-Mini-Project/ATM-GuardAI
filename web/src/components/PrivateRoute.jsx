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
        await user.getIdToken(true);
        const token = await user.getIdTokenResult();
        setAuthorized(token.claims?.admin === true);
      } catch {
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
