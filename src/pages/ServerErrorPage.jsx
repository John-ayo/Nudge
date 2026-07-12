import { useNavigate, useLocation } from "react-router-dom";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function ServerErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage = location.state?.error || null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}`}</style>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)" }}/>

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }}/>

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <button onClick={() => navigate("/dashboard")}>
          <span className="text-xl font-bold" style={{ fontFamily: "'Syne',sans-serif" }}>
            <span style={{ color: "var(--text-primary)" }}>Nudge</span>
            <span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#EF444422", border: "1px solid #EF444444" }}>
            <AlertTriangle size={36} color="#EF4444"/>
          </div>
        </div>

        <p className="text-8xl font-bold mb-2"
          style={{ color: "#EF4444", fontFamily: "'Syne',sans-serif", opacity: 0.2 }}>
          500
        </p>

        <h1 className="text-3xl font-bold mb-3 -mt-4"
          style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
          Something went wrong
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Our server hit a snag. This isn't your fault. Try refreshing or head back to your dashboard.
        </p>

        <div className="rounded-xl px-4 py-3 mb-8 text-left"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
          <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
            {errorMessage ? `Error: ${errorMessage}` : "Error: Internal Server Error (500)"}
          </p>
          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-disabled)" }}>
            If this keeps happening, contact support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: "var(--accent)" }}>
            <RefreshCw size={16}/> Try again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: "transparent", border: "1px solid var(--border-base)", color: "var(--text-muted)" }}>
            <Home size={16}/> Go to Dashboard
          </button>
        </div>
      </div>

      <p className="absolute bottom-8 text-xs" style={{ color: "var(--text-disabled)" }}>
        © 2026 Nudge. Built for doers.
      </p>
    </div>
  );
}