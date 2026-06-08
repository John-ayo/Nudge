import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}`}</style>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(108,99,255,0.08) 0%, transparent 70%)" }}/>

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <button onClick={()=>navigate("/dashboard")}>
          <span className="text-xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>
            <span className="text-white">Nudge</span>
            <span style={{ color:"var(--accent)" }}>.</span>
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor:"var(--accent)22", border:"1px solid var(--accent)44" }}>
            <Search size={36} color="var(--accent)"/>
          </div>
        </div>

        {/* 404 */}
        <p className="text-8xl font-bold mb-2" style={{ color:"var(--accent)", fontFamily:"'Syne',sans-serif", opacity:0.2 }}>404</p>

        <h1 className="text-3xl font-bold text-white mb-3 -mt-4" style={{ fontFamily:"'Syne',sans-serif" }}>
          Page not found
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Looks like this page took the day off. It's not in your tasks either. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={()=>navigate("/dashboard")}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor:"var(--accent)" }}>
            <Home size={16}/> Go to Dashboard
          </button>
          <button
            onClick={()=>navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition-all hover:border-[#444]"
            style={{ backgroundColor:"transparent", border:"1px solid #2a2a2a", color:"#9CA3AF" }}>
            <ArrowLeft size={16}/> Go back
          </button>
        </div>
      </div>

      {/* Bottom hint */}
      <p className="absolute bottom-8 text-gray-700 text-xs">© 2026 Nudge. Built for doers.</p>
    </div>
  );
}