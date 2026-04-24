import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { useAuth } from "./store/useAuth";
import { initAuthListener } from "./firebase/auth";

useAuth.getState().initAuth();
initAuthListener();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);