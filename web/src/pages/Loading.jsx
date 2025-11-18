// src/pages/Loading.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandSplash from "../components/BrandSplash";
import { auth, signInWithEmailAndPassword, signOut } from "../firebase";

export default function Loading() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Accepts either:
  //   { mode:'signin', credentials:{email,password}, next:'/path' }
  //   { next:'/path', delayMs:700 }  OR  { to:'/path', delayMs:700 }
  useEffect(() => {
    let timeoutId = null;
    let active = true; // survives StrictMode double-invoke

    const next = state?.next || state?.to || "/dashboard";
    const delay = Number.isFinite(Number(state?.delayMs))
      ? Number(state?.delayMs)
      : 900; // fallback delay

    (async () => {
      try {
        if (state?.mode === "signin" && state?.credentials) {
          const { email, password } = state.credentials;
          const cred = await signInWithEmailAndPassword(
            auth,
            String(email).trim(),
            String(password)
          );
          const token = await cred.user.getIdToken(true);

          // Check user role from backend API instead of custom claims
          const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
          try {
            const res = await fetch(base + "/api/users/me", {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            
            if (res.ok) {
              const userData = await res.json();
              console.log("User authenticated:", userData);
              // Allow all authenticated users to access (role check happens in the app)
              if (active) navigate(next, { replace: true });
            } else {
              const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
              console.error("API verification failed:", errorData);
              await signOut(auth);
              if (active)
                navigate("/login", {
                  replace: true,
                  state: {
                    error: errorData.error || "Unable to verify account. Please contact administrator.",
                  },
                });
            }
          } catch (fetchError) {
            console.error("Fetch error:", fetchError);
            // If API is unreachable, still allow login (Firebase auth succeeded)
            if (active) navigate(next, { replace: true });
          }
          return;
        }

        // Generic splash → small pause → navigate
        timeoutId = setTimeout(() => {
          if (active) navigate(next, { replace: true });
        }, delay);
      } catch {
        if (active)
          navigate("/login", {
            replace: true,
            state: { error: "Sign-in failed. Please try again." },
          });
      }
    })();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate, state]);

  return (
    <BrandSplash
      subtitle={state?.mode === "signin" ? "Signing you in…" : "Loading…"}
    />
  );
}
