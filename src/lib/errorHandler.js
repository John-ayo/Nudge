/**
 * Global error handler for catching errors from React, Supabase, PostHog, and other sources
 */
export function setupGlobalErrorHandling() {
  // Handle uncaught errors (not caught by error boundary)
  window.addEventListener("error", (event) => {
    console.error("Global error caught:", event.error);
    // Don't redirect - let the error bubble up so ErrorBoundary can catch it
    // or if it's already reached here, show a fallback
    if (event.error && !event.error.handled) {
      event.preventDefault();
      showFallbackError("An unexpected error occurred");
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    event.preventDefault();
    showFallbackError("An unexpected error occurred");
  });
}

/**
 * Show fallback error UI when the app is completely broken
 */
function showFallbackError(message) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background-color: #0a0a0a;
        color: white;
        font-family: 'DM Sans', sans-serif;
      ">
        <h1 style="font-size: 32px; margin-bottom: 16px;">⚠️ Something went wrong</h1>
        <p style="color: #9CA3AF; margin-bottom: 24px;">${message}</p>
        <button onclick="window.location.href = '/'" style="
          padding: 12px 24px;
          background-color: #6C63FF;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        ">
          Go to Home
        </button>
      </div>
    `;
  }
}
