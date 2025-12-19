import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { CameraProvider  } from "./context/CameraContext";
import { AlertsProvider   } from "./context/AlertsContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <UserProvider>
      <CameraProvider >
        <AlertsProvider >
          <App />
        </AlertsProvider >
      </CameraProvider >
      </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);