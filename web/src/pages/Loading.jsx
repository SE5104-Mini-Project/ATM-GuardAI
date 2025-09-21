// src/pages/Loading.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandSplash from "../components/BrandSplash";
import { auth, signInWithEmailAndPassword, signOut } from "../firebase";

export default function Loading() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ran = useRef(false);

  // Expected states when we intentionally navigate here:
  // { mode: 'signin', credentials: {email, password}, next: '/dashboard' }
  // or { next: '/dashboard' } to just show a short splash before redirect.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;

    async function flow() {
      const mode = state?.mode;
      const next = state?.next || "/dashboard";

      try {
        if (mode === "signin" && state?.credentials) {
          const { email, password } = state.credentials;
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
          // force refresh to get custom claims
          await cred.user.getIdToken(true);
          const token = await cred.user.getIdTokenResult();

          if (token.claims?.admin === true) {
            if (!cancelled) navigate(next, { replace: true });
          } else {
            await signOut(auth);
            if (!cancelled)
              navigate("/login", {
                replace: true,
                state: { error: "This account has no admin access. Contact the system administrator." },
              });
          }
          return;
        }

        // Generic splash → brief pause → go next
        setTimeout(() => {
          if (!cancelled) navigate(next, { replace: true });
        }, 1600);
      } catch (e) {
        // Back to login with a friendly error
        if (!cancelled)
          navigate("/login", {
            replace: true,
            state: { error: "Sign-in failed. Please try again." },
          });
      }

      return () => { cancelled = true; };
    }

    flow();
  }, [navigate, state]);

  return <BrandSplash subtitle={state?.mode === "signin" ? "Signing you in…" : "Loading…"} />;
}
