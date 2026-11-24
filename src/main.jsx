import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "./router.jsx";
import { AuthProvider } from "./auth.jsx";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Router>
            <AuthProvider>
                <App />
            </AuthProvider>
        </Router>
    </StrictMode>,
);
