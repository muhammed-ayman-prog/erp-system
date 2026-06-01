import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

import { useAuth } from "./store/useAuth";

registerSW({
  immediate: true,
});

useAuth.getState().initAuth();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);