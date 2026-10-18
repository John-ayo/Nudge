import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";
import ThemeToggle from "../components/ThemeToggle";
import { usePublicTheme } from "../lib/publicTheme";

import "../tailwind-customs.css";

// Palette: every value is a theme variable (see the tokens file)
const C = {
  black: "var(--lp-bg)",
  surface: "var(--lp-surface)",
  card: "var(--lp-card)",
  purple: "var(--accent)",
  purpleDim: "var(--lp-accent-dim)",
  purpleLight: "var(--lp-accent-light)",
  green: "var(--lp-green)",
  gold: "var(--lp-gold)",
  red: "var(--lp-red)",
  teal: "var(--lp-teal)",
  white: "var(--lp-heading)",
  offwhite: "var(--lp-text)",
  grey: "var(--lp-border)",
  greyMid: "var(--lp-border-mid)",
  greyLight: "var(--lp-muted)",
};

// Only link to things that exist on this page
const NAV_LINKS = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
];

// Confetti piece
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

// Interactive Hero Task Card
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
        className="border rounded-2xl p-6 w-full max-w-xs"
        style={{
          background: C.surface,
          borderColor: C.grey,
          boxShadow: "var(--lp-shadow)",
        }}
      >
        {celebrate && (
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-10"
            style={{
              background: "var(--lp-overlay)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div className="text-5xl mb-2">🎉</div>
            <div className="syne text-xl font-black" style={{ color: C.gold }}>
              WELL DONE!
            </div>
            <div className="text-sm mt-1.5" style={{ color: C.offwhite }}>
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
          <div className="syne font-black text-sm" style={{ color: C.white }}>
            Today's Tasks
          </div>
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
                    style={{ stroke: "var(--lp-on-green)" }}
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

        <div className="mt-3.5 pt-3.5 border-t" style={{ borderColor: C.grey }}>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs" style={{ color: C.greyLight }}>
              Daily Progress
            </span>
            <span className="text-xs font-semibold" style={{ color: C.purpleLight }}>
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

// Main Landing Page
export default function LandingPage({ onLogin, onSignup }) {
  const navigate = useNavigate();
  const { theme, toggle } = usePublicTheme();
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
      desc: "Confetti, XP, praise, every completed task is a moment worth celebrating.",
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
    <div data-theme={theme} style={{ colorScheme: theme }}>
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

      <div
        className="min-h-screen overflow-y-auto relative"
        style={{ background: C.black, color: C.offwhite }}
      >
        {/* Navbar */}
        <nav className={`nav-wrap${scrolled ? " scrolled" : ""}`}>
          <div className="nav-inner">
            <div className="syne text-2xl font-black" style={{ color: C.white }}>
              Nudge<span style={{ color: C.purple }}>.</span>
            </div>
            <div className="nav-links">
              {NAV_LINKS.map(([label, href]) => (
                <a key={label} className="nav-link" href={href}>
                  {label}
                </a>
              ))}
            </div>
            <div className="nav-actions">
              <ThemeToggle theme={theme} onToggle={toggle} />
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
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  className="nav-link"
                  href={href}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
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

        {/* Hero */}
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
                professional, Nudge rewards every win, no matter how small.
              </p>

              <div className="hero-ctas">
                <button
                  className="btn-primary animate-pulseRing"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Free
                </button>
              </div>

              <div className="hero-stats">
                {[
                  ["7", "Badges to unlock", C.purple],
                  ["PWA", "Install on any device", C.gold],
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

        {/* Ticker */}
        <div
          className="overflow-hidden border-t border-b py-3"
          style={{
            background: C.surface,
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

        {/* Features */}
        <section id="features" className="section" style={{ scrollMarginTop: 80 }}>
          <div className="section-inner">
            <ScrollReveal>
              <div className="text-center mb-12">
                <div className="section-label">Why Nudge</div>
                <h2
                  className="syne font-black leading-tight -tracking-0.5"
                  style={{ fontSize: "clamp(24px, 4vw, 38px)", color: C.white }}
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
                  className="feature-card h-full flex flex-col"
                  style={{ animation: 'none', opacity: 1 }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 text-2xl shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${f.accent} 9%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${f.accent} 19%, transparent)`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div className="syne text-base font-bold mb-2" style={{ color: C.white }}>
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

        {/* How It Works */}
        <section id="how-it-works" className="section pt-0" style={{ scrollMarginTop: 80 }}>
          <div className="section-inner">
            <ScrollReveal>
              <div className="text-center mb-11">
                <div className="section-label">The Loop</div>
                <h2
                  className="syne font-black -tracking-0.25"
                  style={{ fontSize: "clamp(22px, 3.5vw, 34px)", color: C.white }}
                >
                  How Nudge works
                </h2>
              </div>
            </ScrollReveal>
            <div className="how-grid">
              {HOW_STEPS.map((step, i) => (
               <ScrollReveal key={i} delay={i * 100}>
                <div
                  className="how-card h-full flex flex-col"
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
                  <div className="syne text-base font-bold mb-2" style={{ color: C.white }}>
                    {step.title}
                  </div>
                  <div
                    className="text-sm leading-relaxed mt-auto"
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

        {/* Quote */}
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
                  className="syne font-black leading-relaxed mb-4 max-w-2xl"
                  style={{ fontSize: "clamp(18px, 3vw, 26px)", color: C.white }}
                >
                  Small wins build momentum.
                </p>
                <p className="text-sm" style={{ color: C.greyLight }}>
                  Nudge is built around that idea: every finished task gets a
                  reaction.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA */}
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
                  className="syne font-black -tracking-0.25 mb-3.5"
                  style={{ fontSize: "clamp(28px, 5vw, 44px)", color: C.white }}
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

        {/* Footer */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="syne text-xl font-black" style={{ color: C.white }}>
              Nudge<span style={{ color: C.purple }}>.</span>
            </div>
            <div className="flex gap-6 flex-wrap">
              {NAV_LINKS.map(([label, href]) => (
                <a key={label} href={href} className="nav-link">
                  {label}
                </a>
              ))}
            </div>
            <div className="text-xs" style={{ color: C.greyLight }}>
              © 2026 Nudge. Built for doers.
            </div>
          </div>

          <div
            className="footer-inner mt-6 pt-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4"
            style={{ borderTop: `1px solid ${C.grey}` }}
          >
            <div className="flex gap-6 flex-wrap">
              <Link to="/privacy" className="nav-link text-xs">
                Privacy Policy
              </Link>
              <Link to="/terms" className="nav-link text-xs">
                Terms &amp; Conditions
              </Link>
            </div>
            <div className="text-xs" style={{ color: C.greyLight }}>
              {/* Need help? <a href="mailto:legal@nudgeapp.io" className="nav-link">legal@nudgeapp.io</a> */}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}