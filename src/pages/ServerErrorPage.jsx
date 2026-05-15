import { useNavigate } from "react-router-dom";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}`}</style>

      {/* Background glow — red tint for error feel */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)" }}/>

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <button onClick={()=>navigate("/dashboard")}>
          <span className="text-xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>
            <span className="text-white">Nudge</span>
            <span style={{ color:"#6C63FF" }}>.</span>
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor:"#EF444422", border:"1px solid #EF444444" }}>
            <AlertTriangle size={36} color="#EF4444"/>
          </div>
        </div>

        {/* 500 */}
        <p className="text-8xl font-bold mb-2" style={{ color:"#EF4444", fontFamily:"'Syne',sans-serif", opacity:0.2 }}>500</p>

        <h1 className="text-3xl font-bold text-white mb-3 -mt-4" style={{ fontFamily:"'Syne',sans-serif" }}>
          Something went wrong
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Our server hit a snag. This isn't your fault. We're on it. Try refreshing or head back to your dashboard.
        </p>

        {/* Error detail box */}
        <div className="rounded-xl px-4 py-3 mb-8 text-left" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
          <p className="text-gray-500 text-xs font-mono">Error: Internal Server Error (500)</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5">If this keeps happening, contact support.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={()=>window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor:"#6C63FF" }}>
            <RefreshCw size={16}/> Try again
          </button>
          <button
            onClick={()=>navigate("/dashboard")}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition-all hover:border-[#444]"
            style={{ backgroundColor:"transparent", border:"1px solid #2a2a2a", color:"#9CA3AF" }}>
            <Home size={16}/> Go to Dashboard
          </button>
        </div>
      </div>

      <p className="absolute bottom-8 text-gray-700 text-xs">© 2026 Nudge. Built for doers.</p>
    </div>
  );
}