import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl px-5 py-4 shadow-xl flex items-center justify-between gap-4"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--accent)",
      }}>
      <div className="flex items-center gap-3">
        <img src="/nudge-icon-512.png" alt="Nudge" className="w-10 h-10 rounded-xl"/>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Syne',sans-serif" }}>
            Install Nudge
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Add to home screen for the best experience
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="rounded-xl px-4 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}>
          Install
        </button>
        <button
          onClick={() => setVisible(false)}
          className="rounded-xl px-4 py-1.5 text-xs font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--border-base)",
            color: "var(--text-muted)",
          }}>
          Not now
        </button>
      </div>
    </div>
  );
}