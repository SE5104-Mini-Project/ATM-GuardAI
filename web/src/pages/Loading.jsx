import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandSplash from "../components/BrandSplash";

export default function Loading() {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    let timeoutId = null;
    let active = true;

    const next = state?.next || state?.to || "/dashboard";
    const delay = Number.isFinite(Number(state?.delayMs))
      ? Number(state?.delayMs)
      : 900;

    (async () => {
      try {
        if (state?.mode === "signin" && state?.credentials) {
          console.log("Mock signin with:", state.credentials);
          timeoutId = setTimeout(() => {
            if (active) navigate(next, { replace: true });
          }, 1000);
          return;
        }

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