import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function NudgeLogo() {
  return (
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "20px" }}>
      <span style={{ color: "var(--accent)" }}>Nu</span>
      <span style={{ color: "var(--text-primary)" }}>dge</span>
      <span style={{ color: "var(--accent)" }}>.</span>
    </span>
  );
}

export function LegalSection({ title, blocks }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3"
        style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
        {title}
      </h2>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
              {block.text}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="space-y-2 mb-3">
              {block.items.map((item, j) => (
                <li key={j} className="text-sm leading-relaxed flex gap-2.5" style={{ color: "var(--text-muted)" }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}/>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </section>
  );
}

export default function LegalLayout({ title, effectiveDate, intro, notice, otherPageLabel, otherPageHref, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--bg-subtle); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor: "var(--bg-base)", borderBottom: "1px solid var(--border-strong)" }}>
        <button onClick={() => navigate("/")}>
          <NudgeLogo/>
        </button>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
          style={{ border: "1px solid var(--border-base)", color: "var(--text-muted)" }}>
          <ArrowLeft size={14}/> Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2"
            style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
            {title}
          </h1>
          <p className="text-xs mb-8" style={{ color: "var(--text-faint)" }}>
            Effective Date: {effectiveDate}
          </p>

          {intro && (
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
              {intro}
            </p>
          )}

          {notice && (
            <div className="rounded-2xl px-4 py-3 mb-8"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)", borderLeft: "3px solid var(--accent)" }}>
              <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
                {notice}
              </p>
            </div>
          )}

          {children}

          <div className="mt-12 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
              © 2026 Nudge. Built for doers.
            </p>
            <Link to={otherPageHref} className="text-sm font-semibold hover:underline"
              style={{ color: "var(--accent)" }}>
              {otherPageLabel} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}