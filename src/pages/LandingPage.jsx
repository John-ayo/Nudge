import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";

import "../tailwind-customs.css";

// ── Palette ───────────────────────────────────────────────────
const C = {
  black: "#000000",
  surface: "#0D0D0D",
  card: "#111111",
  purple: "#6C63FF",
  purpleDim: "#3D3870",
  purpleLight: "#A89EFF",
  green: "#00E896",
  gold: "#FFD166",
  red: "#FF6B6B",
  teal: "#00BFA6",
  white: "#FFFFFF",
  offwhite: "#F5F5F5",
  grey: "#2A2A2A",
  greyMid: "#444444",
  greyLight: "#888888",
};

// ── Confetti piece ────────────────────────────────────────────
function ConfettiPiece({ x, color, delay }) {
  return (
    <div
      className="absolute top-0 w-1.75 h-1.75 rounded-full pointer-events-none z-1000 animate-confettiFall"
      style={{
        left: `${x}%`,
        background: color,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ── Interactive Hero Task Card ────────────────────────────────
function generateConfetti() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: [
      C.purple,
      C.gold,
      C.green,
      C.white,
      C.purpleLight,
    ][Math.floor(Math.random() * 5)],
    delay: Math.random() * 0.4,
  }));
}

function HeroTaskCard() {
  const [taskDone, setTaskDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [confetti] = useState(generateConfetti);

  function doTask() {
    if (taskDone) return;
    setTaskDone(true);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2600);
  }

  return (
    <div className="relative">
      {celebrate && confetti.map((p) => <ConfettiPiece key={p.id} {...p} />)}
      <div
        className="bg-surface border border-grey rounded-2xl p-6 w-full max-w-xs"
        style={{
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)`,
        }}
      >
        {celebrate && (
          <div
            className="absolute inset-0 bg-black/92 rounded-2xl flex flex-col items-center justify-center z-10"
            style={{
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div className="text-5xl mb-2">🎉</div>
            <div className="syne text-xl font-black" style={{ color: C.gold }}>
              WELL DONE!
            </div>
            <div className="text-offwhite text-sm mt-1.5">
              You crushed it 💪
            </div>
            <div
              className="mt-3 rounded-full py-1 px-3.5 text-xs font-semibold"
              style={{
                background: C.purpleDim,
                color: C.purpleLight,
              }}
            >
              +50 XP earned
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4.5">
          <div className="syne text-white font-black text-sm">Today's Tasks</div>
          <div
            className="rounded-full py-0.75 px-2.5 text-xs font-semibold"
            style={{
              background: C.purpleDim,
              color: C.purpleLight,
            }}
          >
            🔥 7 day streak
          </div>
        </div>

        {[
          { t: "Reply to client emails", done: true },
          { t: "Submit project proposal", done: false, active: true },
          { t: "Review sprint notes", done: false },
        ].map((item, i) => (
          <div
            key={i}
            onClick={item.active ? doTask : undefined}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-2.5 mb-1.5 cursor-pointer transition-all duration-200"
            style={{
              background: item.active ? "rgba(108,99,255,0.08)" : "transparent",
              border: item.active ? `1px solid ${C.purpleDim}` : "1px solid transparent",
            }}
          >
            <div
              className="shrink-0 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                width: 20,
                height: 20,
                border:
                  item.done || (item.active && taskDone)
                    ? "none"
                    : `2px solid ${C.greyMid}`,
                background:
                  item.done || (item.active && taskDone)
                    ? C.green
                    : "transparent",
              }}
            >
              {(item.done || (item.active && taskDone)) && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="#000"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <span
              className="text-sm transition-all duration-300"
              style={{
                color:
                  item.done || (item.active && taskDone)
                    ? C.greyLight
                    : C.offwhite,
                textDecoration:
                  item.done || (item.active && taskDone)
                    ? "line-through"
                    : "none",
              }}
            >
              {item.t}
            </span>
          </div>
        ))}

        {!taskDone && (
          <div
            className="px-3 py-2 rounded-2.5 mt-1 text-xs"
            style={{
              background: "rgba(108,99,255,0.05)",
              border: `1px dashed ${C.purpleDim}`,
              color: C.greyLight,
            }}
          >
            👆 Tap the active task to complete
          </div>
        )}

        <div className="mt-3.5 pt-3.5 border-t border-grey">
          <div className="flex justify-between mb-1.5">
            <span className="text-greyLight text-xs">Daily Progress</span>
            <span className="text-purpleLight text-xs font-semibold">
              {taskDone ? "2/3" : "1/3"}
            </span>
          </div>
          <div className="h-1 rounded-full" style={{ background: C.grey }}>
            <div
              className="h-full rounded-full transition-all duration-600"
              style={{
                background: `linear-gradient(90deg, ${C.purple}, ${C.purpleLight})`,
                width: taskDone ? "66%" : "33%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────
export default function LandingPage({ onLogin, onSignup }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const tickerItems = [
    "Complete tasks",
    "Earn XP",
    "Build streaks",
    "Feel proud",
    "Stay focused",
    "Celebrate wins",
    "Level up",
    "Stay consistent",
  ];

  const FEATURES = [
    {
      icon: "🎉",
      title: "Celebrate Every Win",
      desc: "Confetti, XP, praise — every completed task is a moment worth celebrating.",
      accent: C.gold,
    },
    {
      icon: "⏱",
      title: "Focus Timer",
      desc: "Lock in with a Pomodoro timer linked to your task. Finish what you start.",
      accent: C.purple,
    },
    {
      icon: "🔥",
      title: "Build Your Streak",
      desc: "Track your daily streak and watch momentum grow day after day.",
      accent: C.red,
    },
    {
      icon: "⚡",
      title: "Earn XP and Level Up",
      desc: "Every task earns points. Unlock badges that show what you are made of.",
      accent: C.purpleLight,
    },
    {
      icon: "📊",
      title: "Your Pride Chart",
      desc: "Visual history of everything you have crushed. See real progress.",
      accent: C.green,
    },
    {
      icon: "🛡",
      title: "Streak Protection",
      desc: "Bad days happen. Grace days protect your streak so one hard day doesn't erase your work.",
      accent: C.teal,
    },
  ];

  const HOW_STEPS = [
    {
      num: "01",
      icon: "🚀",
      label: "START",
      title: "Feel motivated to begin",
      desc: "A hype message kicks off every task so starting never feels hard.",
      color: C.purple,
    },
    {
      num: "02",
      icon: "⏱",
      label: "DO",
      title: "Stay focused while working",
      desc: "Timer keeps you locked in. Progress bar keeps you moving.",
      color: C.purpleLight,
    },
    {
      num: "03",
      icon: "🎉",
      label: "FINISH",
      title: "Get celebrated",
      desc: "Confetti. Praise. XP. Every completion is a moment.",
      color: C.gold,
    },
    {
      num: "04",
      icon: "📈",
      label: "REFLECT",
      title: "Feel proud",
      desc: "Streak, XP summary, and your pride chart say it all.",
      color: C.green,
    },
  ];

  return (
    <>
      <div className="grid-bg" />
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: C.purple,
          top: -200,
          right: -200,
        }}
      />
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          background: C.purpleDim,
          bottom: 100,
          left: -100,
        }}
      />

      <div className="min-h-screen overflow-y-auto bg-black relative">
        {/* ── Navbar ── */}
        <nav className={`nav-wrap${scrolled ? " scrolled" : ""}`}>
          <div className="nav-inner">
            <div className="syne text-2xl font-black text-white">
              Nudge<span className="text-purple">.</span>
            </div>
            <div className="nav-links">
              {["Features", "How it works", "About"].map((l) => (
                <a key={l} className="nav-link" href="#">
                  {l}
                </a>
              ))}
            </div>
            <div className="nav-actions">
              <button
                className="btn-ghost hidden sm:block px-5 py-2.25 text-sm"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
              <button
                className="btn-primary px-5 py-2.25 text-sm"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
              <button
                className="hamburger"
                onClick={() => setMenuOpen((m) => !m)}
                aria-label="Menu"
              >
                {[0, 1, 2].map((i) => (
                  <span key={i} />
                ))}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="mobile-menu animate-fadeUp" style={{ transformOrigin: "top" }}>
              {["Features", "How it works", "About"].map((l) => (
                <a
                  key={l}
                  className="nav-link"
                  href="#"
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              ))}
              <button
                className="btn-ghost mt-2 w-full justify-center"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Log In
              </button>
              <button
                className="btn-primary w-full justify-center"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/signup");
                }}
              >
                Get Started Free
              </button>
            </div>
          )}
        </nav>

        {/* ── Hero ── */}
        <section className="hero-section">
          <div className="hero-inner">
            <div className="hero-text" style={{ animation: 'none' }}>

             <ScrollReveal>
              <h1 className="hero-h1">
                <span className="text-reveal-wrapper"><span className="text-reveal-inner">Stop surviving</span></span><br />
                <span className="text-reveal-wrapper"><span className="text-reveal-inner" style={{ transitionDelay: '100ms' }}>your tasks.</span></span><br />
                <span className="text-reveal-wrapper">
                  <span className="text-reveal-inner animate-glowPulse" style={{ color: C.purple, transitionDelay: '200ms' }}>Start celebrating</span>
                </span>
                <br />
                <span className="text-reveal-wrapper"><span className="text-reveal-inner" style={{ transitionDelay: '300ms' }}>them.</span></span>
              </h1>
             </ScrollReveal>

             <ScrollReveal delay={400}>
              <p
                className="text-base leading-relaxed mb-8 max-w-lg"
                style={{ color: C.greyLight }}
              >
                Whether you are a student, a builder, a creative, or a
                professional — Nudge rewards every win, no matter how small.
              </p>

              <div className="hero-ctas">
                <button
                  className="btn-primary animate-pulseRing"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Free
                </button>
                <button className="btn-ghost">Watch Demo ▶</button>
              </div>

              <div className="hero-stats">
                {[
                  ["3x", "More tasks done", C.purple],
                  ["92%", "Feel motivated", C.gold],
                  ["Free", "To get started", C.green],
                ].map(([v, l, c]) => (
                  <div key={l} className="text-center">
                    <div className="hero-stat-val" style={{ color: c }}>
                      {v}
                    </div>
                    <div
                      className="text-xs mt-1.25"
                      style={{ color: C.greyLight }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
             </ScrollReveal>
            </div>

            <div className="hero-card" style={{ animation: 'none' }}>
              <ScrollReveal delay={200}>
                <HeroTaskCard />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Ticker ── */}
        <div
          className="overflow-hidden border-t border-b border-grey py-3 bg-surface"
          style={{
            borderColor: C.grey,
          }}
        >
          <div className="inline-flex animate-ticker">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 mr-12"
              >
                <span className="text-sm" style={{ color: C.purple }}>
                  ✦
                </span>
                <span
                  className="text-xs font-medium tracking-widest uppercase"
                  style={{ color: C.greyLight }}
                >
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section className="section">
          <div className="section-inner">
            <ScrollReveal>
              <div className="text-center mb-12">
                <div className="section-label">Why Nudge</div>
                <h2
                  className="syne font-black leading-tight -tracking-0.5 text-white"
                  style={{ fontSize: "clamp(24px, 4vw, 38px)" }}
                >
                  <span className="text-reveal-wrapper"><span className="text-reveal-inner">Every task has a beginning,</span></span>
                  <br />
                  <span className="text-reveal-wrapper">
                    <span className="text-reveal-inner" style={{ color: C.purpleLight, transitionDelay: '100ms' }}>
                      a middle, and an end that feels rewarding.
                    </span>
                  </span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="features-grid">
              {FEATURES.map((f, i) => (
               <ScrollReveal key={i} delay={i * 100}>
                <div
                  className="feature-card"
                  style={{ animation: 'none', opacity: 1 }}
                >
                  <div
                    className="w-11 h-11 rounded-2.75 flex items-center justify-center mb-4 text-2xl"
                    style={{
                      background: `${f.accent}18`,
                      border: `1px solid ${f.accent}30`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div className="syne text-base font-bold mb-2 text-white">
                    {f.title}
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: C.greyLight }}
                  >
                    {f.desc}
                  </div>
                </div>
               </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="section pt-0">
          <div className="section-inner">
            <ScrollReveal>
              <div className="text-center mb-11">
                <div className="section-label">The Loop</div>
                <h2
                  className="syne font-black text-white -tracking-0.25"
                  style={{ fontSize: "clamp(22px, 3.5vw, 34px)" }}
                >
                  How Nudge works
                </h2>
              </div>
            </ScrollReveal>
            <div className="how-grid">
              {HOW_STEPS.map((step, i) => (
               <ScrollReveal key={i} delay={i * 100}>
                <div
                  className="how-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = step.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.grey;
                  }}
                >
                  <div
                    className="text-xs font-black tracking-widest mb-3.5"
                    style={{ color: C.grey }}
                  >
                    {step.num}
                  </div>
                  <div className="text-3xl mb-2.5">{step.icon}</div>
                  <div
                    className="text-xs font-black tracking-widest mb-1.5"
                    style={{ color: step.color }}
                  >
                    {step.label}
                  </div>
                  <div className="syne text-base font-bold mb-2 text-white">
                    {step.title}
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: C.greyLight }}
                  >
                    {step.desc}
                  </div>
                </div>
               </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quote ── */}
        <section className="section pt-0">
          <div className="section-inner">
            <ScrollReveal>
              <div
                className="rounded-2xl py-8 px-8 lg:py-14 lg:px-16 border relative overflow-hidden"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.grey}`,
                  borderLeft: `4px solid ${C.purple}`,
                }}
              >
                <div
                  className="absolute top-0 right-0 w-44 h-44 rounded-full blur-2xl -z-10"
                  style={{ background: C.purple, opacity: 0.05 }}
                />
                <div
                  className="text-6xl leading-none mb-3.5"
                  style={{ color: C.purple, fontFamily: "Georgia, serif" }}
                >
                  "
                </div>
                <p
                  className="syne font-black leading-relaxed text-white mb-4 max-w-2xl"
                  style={{ fontSize: "clamp(18px, 3vw, 26px)" }}
                >
                  People complete 3x more tasks when they feel rewarded for their
                  effort.
                </p>
                <p className="text-sm" style={{ color: C.greyLight }}>
                  Nudge is designed around that exact psychology.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="section pt-0 pb-24 lg:pb-32">
          <div className="section-inner">
            <ScrollReveal>
              <div
                className="text-center py-12 lg:py-20 px-5 lg:px-10 rounded-2xl border"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(108,99,255,0.12) 0%, transparent 70%)`,
                  border: `1px solid ${C.purpleDim}`,
                }}
              >
                <div className="text-5xl mb-3.5">✦</div>
                <h2
                  className="syne font-black text-white -tracking-0.25 mb-3.5"
                  style={{ fontSize: "clamp(28px, 5vw, 44px)" }}
                >
                  Your next win is
                  <br />
                  <span style={{ color: C.purple }}>one task away.</span>
                </h2>
                <p
                  className="text-base mx-auto mb-8 max-w-96"
                  style={{ color: C.greyLight }}
                >
                  Join doers who have stopped dreading their task lists and
                  started owning them.
                </p>
                <button
                  className="btn-primary text-base px-11 py-3.75"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up Free
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="syne text-xl font-black text-white">
              Nudge<span style={{ color: C.purple }}>.</span>
            </div>
            <div className="flex gap-6 flex-wrap">
              {["Features", "About", "Contact"].map((l) => (
                <a key={l} href="#" className="nav-link">
                  {l}
                </a>
              ))}
            </div>
            <div className="text-xs" style={{ color: C.greyLight }}>
              © 2026 Nudge. Built for doers.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
