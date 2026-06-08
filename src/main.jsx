import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import posthog from "posthog-js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";
import { AccentProvider } from "./context/AccentContext.jsx";
import "./index.css";
import App from "./App.jsx";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host:         import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
  person_profiles:  "identified_only",
  capture_pageview: false,
  capture_pageleave: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AccentProvider>
          <TasksProvider>
            <App />
          </TasksProvider>
        </AccentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);