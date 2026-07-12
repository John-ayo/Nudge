import { useEffect } from "react";
import BadgeIcon from "./BadgeIcon";
import { BADGES } from "../lib/badges";

export default function BadgeModal({ badgeKey, onDismiss }) {
  const badge = BADGES[badgeKey];

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onDismiss(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", animation: "bmFadeIn 0.3s ease" }}
      onClick={onDismiss}
    >
      <style>{`
        @keyframes bmFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes bmPopIn  { from { opacity:0; transform:scale(0.85) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes bmShimmer{ 0%,100%{opacity:0.6;} 50%{opacity:1;} }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
      `}</style>

      <div
        className="relative rounded-3xl p-8 flex flex-col items-center text-center max-w-xs w-full"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid rgba(108,99,255,0.3)",
          boxShadow: "0 0 80px rgba(108,99,255,0.18), 0 0 30px rgba(108,99,255,0.08)",
          animation: "bmPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          fontFamily: "'DM Sans',sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pill */}
        <div className="mb-6">
          <span
            className="rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
            style={{
              backgroundColor: "#1a1630",
              color: "var(--accent, #6C63FF)",
              border: "1px solid rgba(108,99,255,0.3)",
              animation: "bmShimmer 2s ease infinite",
            }}
          >
            Badge Unlocked
          </span>
        </div>

        {/* Illustration */}
        <div className="mb-6" style={{ filter: "drop-shadow(0 0 24px rgba(108,99,255,0.45))" }}>
          <BadgeIcon badgeKey={badgeKey} unlocked size={120} />
        </div>

        {/* Name */}
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}
        >
          {badge.name}
        </h2>

        {/* Category */}
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--border-base)" }}
        >
          {badge.category}
        </span>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          {badge.description}
        </p>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="w-full rounded-2xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "var(--accent, #6C63FF)" }}
        >
          Let's go!
        </button>
      </div>
    </div>
  );
}