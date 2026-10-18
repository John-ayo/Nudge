import { Link } from "react-router-dom";
import { usePublicTheme } from "../../lib/publicTheme";
import ThemeToggle from "../ThemeToggle";

const FEATURES = [
  { icon: "🎉", label: "Celebrate every completed task" },
  { icon: "🔥", label: "Build daily streaks and earn xp" },
  { icon: "🟢", label: "See your progress and feel proud" },
];

export default function AuthShell({ icon, headline, blurb, children }) {
  const { theme, toggle } = usePublicTheme();

  return (
    <div
      data-theme={theme}
      className="min-h-screen flex flex-col lg:flex-row"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
        colorScheme: theme,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* LEFT PANEL: desktop only */}
      <aside
        className="hidden lg:flex relative lg:w-[45%] flex-col justify-between p-14 min-h-screen overflow-hidden"
        style={{ backgroundColor: "var(--bg-sidebar)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px,transparent 1px),linear-gradient(90deg,var(--text-primary) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none opacity-15"
          style={{
            background: "radial-gradient(circle,var(--accent) 0%,transparent 70%)",
            transform: "translate(-35%,35%)",
          }}
        />

        <div className="relative z-10">
          <span className="syne text-2xl font-bold">
            <span style={{ color: "var(--text-primary)" }}>Nudge</span>
            <span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>

        <div className="relative z-10">
          <div className="text-5xl mb-6">{icon}</div>
          <h2
            className="syne text-5xl font-bold leading-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {headline}
          </h2>
          <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: "var(--text-faint)" }}>
            {blurb}
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: "var(--text-disabled)" }}>
          © 2026 Nudge. Built for doers.
        </p>
      </aside>

      {/* RIGHT PANEL */}
      <main className="relative flex-1 flex items-center justify-center px-6 pt-20 pb-10 lg:p-14">
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>

        <div className="w-full max-w-[440px]">
          <Link
            to="/"
            className="syne text-2xl font-bold mb-8 inline-block lg:hidden"
            style={{ color: "var(--text-primary)" }}
          >
            Nudge<span style={{ color: "var(--accent)" }}>.</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}