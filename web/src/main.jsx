import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import "./index.css";
import App from "./App.jsx";

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);