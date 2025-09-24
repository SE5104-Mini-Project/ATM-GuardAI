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
          await cred.user.getIdToken(true);
          const token = await cred.user.getIdTokenResult();

          if (token.claims?.admin === true) {
            if (active) navigate(next, { replace: true });
          } else {
            await signOut(auth);
            if (active)
              navigate("/login", {
                replace: true,
                state: {
                  error:
                    "This account has no admin access. Contact the system administrator.",
                },
              });
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
