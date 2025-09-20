// src/components/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "../firebase";

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
        // refresh token to read latest custom claims
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
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking authentication…
      </div>
    );
  }

  return authorized ? children : <Navigate to="/login" replace />;
}
