import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import posthog from "posthog-js";
import { setupGlobalErrorHandling } from "./Lib/errorHandler.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";
import { AccentProvider } from "./context/AccentContext.jsx";
import "./index.css";
import App from "./App.jsx";

// Set up global error handling for all uncaught errors and promise rejections
setupGlobalErrorHandling();

// Initialize PostHog with try/catch
try {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host:         import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles:  "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });
} catch (error) {
  console.error("PostHog initialization failed:", error);
}

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