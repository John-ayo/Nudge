import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { supabase } from "../lib/supabase";

const BADGE_LABELS = {
  first_blood: "First Blood",
  on_a_roll: "On a Roll",
  unstoppable: "Unstoppable",
  century: "Century",
  xp_hunter: "XP Hunter",
  speed_demon: "Speed Demon",
  centurion: "Centurion",
};

function StatTile({ value, label }) {
  return (
    <div
      className="rounded-2xl p-5 text-center border"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-base)" }}
    >
      <div className="syne text-3xl font-bold" style={{ color: "var(--accent)" }}>{value}</div>
      <div className="text-xs mt-1 uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{label}</div>
    </div>
  );
}

// Rendered off screen, then converted to a PNG. Inline styles on purpose.
// The wrapper hides the card off screen. The captured node (cardRef) must not be
// positioned off screen itself, or the clone renders outside the image and comes out blank.
function ShareCard({ stats, cardRef }) {
  const cell = {
    background: "#111111",
    border: "1px solid #1f1f1f",
    borderRadius: 28,
    padding: "44px 24px",
    textAlign: "center",
  };
  const num = { fontFamily: "'Syne', sans-serif", fontSize: 104, fontWeight: 800, color: "#6C63FF", lineHeight: 1 };
  const cap = { fontSize: 28, color: "#888888", marginTop: 14, textTransform: "uppercase", letterSpacing: 2 };
  const extras = [];
  if (stats.badges?.length) extras.push(`${stats.badges.length} ${stats.badges.length === 1 ? "badge" : "badges"} unlocked`);
  if (stats.prsMerged > 0) extras.push(`${stats.prsMerged} PRs merged`);
  if (typeof stats.commits === "number" && stats.commits > 0) extras.push(`${stats.commits} public commits`);

  return (
    <div aria-hidden="true" style={{ position: "fixed", left: "-10000px", top: 0, pointerEvents: "none" }}>
      <div
        ref={cardRef}
        style={{
          width: 1080,
          height: 1350,
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at 20% 100%, rgba(108,99,255,0.28), #000000 60%)",
          color: "#F5F5F5",
          fontFamily: "'DM Sans', Arial, sans-serif",
          padding: 80,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 56, fontWeight: 800 }}>
          <span style={{ color: "#6C63FF" }}>Nu</span>dge
        </div>

        <div>
          <div style={{ fontSize: 34, color: "#A89EFF", letterSpacing: 4, textTransform: "uppercase" }}>My month on Nudge</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 92, fontWeight: 800, marginTop: 12 }}>{stats.label}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div style={cell}><div style={num}>{stats.tasksDone}</div><div style={cap}>Tasks done</div></div>
          <div style={cell}><div style={num}>{stats.xpEarned}</div><div style={cap}>XP earned</div></div>
          <div style={cell}><div style={num}>{stats.activeDays}</div><div style={cap}>Active days</div></div>
          <div style={cell}><div style={num}>{stats.longestRun}</div><div style={cap}>Best run</div></div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 30, color: "#888888" }}>
          <div>{extras.join("  |  ")}</div>
          <div style={{ color: "#6C63FF", fontWeight: 700 }}>nudge.com.ng</div>
        </div>
      </div>
    </div>
  );
}

function ReportDetail({ report }) {
  const stats = report.stats;
  const cardRef = useRef(null);
  const [png, setPng] = useState("");
  const [busy, setBusy] = useState(false);
  const [cardError, setCardError] = useState("");

  async function createCard() {
    setBusy(true);
    setCardError("");
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const url = await toPng(cardRef.current, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: "#000000",
      });
      setPng(url);
    } catch (err) {
      console.error(err);
      setCardError("Could not create the image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const a = document.createElement("a");
    a.href = png;
    a.download = `nudge-${stats.month}.png`;
    a.click();
  }

  async function share() {
    setCardError("");
    try {
      const blob = await (await fetch(png)).blob();
      const file = new File([blob], `nudge-${stats.month}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `My ${stats.label} on Nudge` });
      } else {
        download();
      }
    } catch (err) {
      if (err?.name !== "AbortError") setCardError("Sharing failed. Use Download instead.");
    }
  }

  return (
    <div>
      <h1 className="syne text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{stats.label}</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-faint)" }}>
        Best run is your longest streak of active days in the month.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile value={stats.tasksDone} label="Tasks done" />
        <StatTile value={stats.xpEarned} label="XP earned" />
        <StatTile value={stats.activeDays} label="Active days" />
        <StatTile value={stats.longestRun} label="Best run" />
      </div>

      <div
        className="rounded-2xl p-5 border mb-6 space-y-2 text-sm"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-base)", color: "var(--text-muted)" }}
      >
        <div>
          Badges unlocked:{" "}
          {stats.badges?.length ? stats.badges.map((b) => BADGE_LABELS[b] ?? b).join(", ") : "none this month"}
        </div>
        {stats.prsMerged > 0 && <div>Pull requests merged: {stats.prsMerged}</div>}
        {typeof stats.commits === "number" && stats.commits > 0 && <div>Public commits: {stats.commits}</div>}
      </div>

      {!png ? (
        <button
          type="button"
          onClick={createCard}
          disabled={busy}
          className="rounded-2xl px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {busy ? "Creating card..." : "Create share card"}
        </button>
      ) : (
        <div>
          <img src={png} alt={`Your ${stats.label} share card`} className="w-full max-w-xs rounded-2xl border mb-4" style={{ borderColor: "var(--border-base)" }} />
          <div className="flex gap-3">
            <button type="button" onClick={share} className="rounded-2xl px-6 py-3 text-sm font-bold text-white hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}>
              Share
            </button>
            <button
              type="button"
              onClick={download}
              className="rounded-2xl px-6 py-3 text-sm font-medium border"
              style={{ borderColor: "var(--border-base)", color: "var(--text-primary)" }}
            >
              Download
            </button>
          </div>
        </div>
      )}
      {cardError && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{cardError}</p>}

      <ShareCard stats={stats} cardRef={cardRef} />
    </div>
  );
}

export default function ReportsPage({ onMenuOpen }) {
  const { month } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("monthly_reports")
      .select("id, month, stats")
      .order("month", { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError("Could not load your reports.");
        else setReports(data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = month ? reports.find((r) => r.stats?.month === month) : null;

  return (
    <div className="flex-1 p-5 lg:p-10 max-w-3xl w-full mx-auto" style={{ color: "var(--text-primary)" }}>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-xl border"
          style={{ borderColor: "var(--border-base)" }}
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {month ? (
          <Link to="/reports" className="text-sm" style={{ color: "var(--accent)" }}>All reports</Link>
        ) : (
          <h1 className="syne text-2xl font-bold">Monthly reports</h1>
        )}
      </div>

      {loading && <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />}
      {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

      {!loading && !error && month && !selected && (
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
          No report found for that month. <Link to="/reports" style={{ color: "var(--accent)" }}>See all reports</Link>
        </p>
      )}

      {!loading && selected && <ReportDetail key={selected.id} report={selected} />}

      {!loading && !error && !month && (
        reports.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Your first report arrives on the 1st of next month.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Link
                key={r.id}
                to={`/reports/${r.stats.month}`}
                className="flex items-center justify-between rounded-2xl p-5 border hover:border-[color:var(--accent)] transition-colors"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-base)" }}
              >
                <span className="syne font-bold">{r.stats.label}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {r.stats.tasksDone} tasks, {r.stats.xpEarned} XP
                </span>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}