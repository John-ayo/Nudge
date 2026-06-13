import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PartyPopper, Flame, Zap } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useAuth } from "../context/AuthContext";
import { fetchSettings } from "../lib/settings";
import { trackFocusSessionStarted } from "../lib/analytics";

function NudgeLogo() {
  return (
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "20px" }}>
      <span style={{ color: "var(--accent)" }}>Nu</span>
      <span style={{ color: "var(--text-primary)" }}>dge</span>
      <span style={{ color: "var(--accent)" }}>.</span>
    </span>
  );
}

function CelebrationOverlay({ taskTitle, xpAwarded, newStreak, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.92)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
        <div className="flex justify-center mb-4"><PartyPopper size={48} color="var(--accent)"/></div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-2"
          style={{ fontFamily: "'Syne',sans-serif", color: "#F59E0B" }}>
          WELL DONE!
        </h2>
        <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {taskTitle}
        </p>
        <p className="text-sm mb-6 flex items-center justify-center gap-1" style={{ color: "var(--text-muted)" }}>
          Focus session complete! <Flame size={16} color="#F97316"/>
        </p>
        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "var(--accent)" }}>
            <Zap size={14}/> +{xpAwarded} XP
          </span>
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "#064E3B" }}>
            <Flame size={14} color="#F97316"/> {newStreak} day streak
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-disabled)" }}>Tap anywhere to continue</p>
      </div>
    </div>
  );
}

export default function FocusPage() {
  const location       = useLocation();
  const navigate       = useNavigate();
  const { toggleTask } = useTasks();
  const { user }       = useAuth();

  const task = location.state?.task ?? null;

  const [totalSecs,   setTotalSecs]   = useState((task?.est ?? 25) * 60);
  const [timeLeft,    setTimeLeft]    = useState((task?.est ?? 25) * 60);
  const [sessionMins, setSessionMins] = useState(task?.est ?? 25);
  const [running,     setRunning]     = useState(true);
  const [completed,   setCompleted]   = useState(false);
  const [celebration, setCelebration] = useState(null);

  const completedRef = useRef(false);

  useEffect(() => {
    if (!task && user?.id) {
      fetchSettings(user.id).then(s => {
        if (s?.focus_mins) {
          const secs = s.focus_mins * 60;
          setTotalSecs(secs);
          setTimeLeft(secs);
          setSessionMins(s.focus_mins);
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (task) trackFocusSessionStarted({ task_id: task.id, est: task.est });
  }, []);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (timeLeft === 0 && !completedRef.current) {
      handleComplete();
    }
  }, [timeLeft]);

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    setRunning(false);
    if (task && !task.done) {
      await toggleTask(task, (data) => setCelebration(data));
    } else {
      navigate("/dashboard");
    }
  }, [task, toggleTask, navigate]);

  const handlePause   = () => setRunning(prev => !prev);
  const handleAbandon = () => navigate(-1);
  const handleCelebrationClose = () => { setCelebration(null); navigate("/dashboard"); };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const size     = typeof window !== "undefined" && window.innerWidth < 480 ? 220 : 280;
  const cx       = size / 2;
  const cy       = size / 2;
  const r        = size === 220 ? 90 : 118;
  const circ     = 2 * Math.PI * r;
  const progress = totalSecs > 0 ? timeLeft / totalSecs : 1;
  const offset   = circ * (1 - progress);

  const dotAngle = -Math.PI / 2 + progress * 2 * Math.PI;
  const dotX     = cx + r * Math.cos(dotAngle);
  const dotY     = cy + r * Math.sin(dotAngle);

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-5 lg:px-8 py-5">
        <NudgeLogo/>
        <button
          onClick={handleAbandon}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
          style={{ border: "1px solid var(--border-base)", color: "var(--text-primary)", backgroundColor: "transparent" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-base)"; }}>
          ← Exit Focus
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-5 pb-10">

        <div className="text-center px-4">
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "var(--text-disabled)" }}>
            FOCUS MODE
          </p>
          <h1 className="text-2xl lg:text-4xl font-bold"
            style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)", maxWidth: "560px", lineHeight: "1.2", wordBreak: "break-word" }}>
            {task?.title ?? "Focus Session"}
          </h1>
        </div>

        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="1.5"/>
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={completed ? "#22C55E" : "var(--accent)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
            />
            {progress > 0.01 && progress < 0.999 && (
              <circle cx={dotX} cy={dotY} r="4" fill="var(--accent)"/>
            )}
          </svg>

          <div className="absolute flex flex-col items-center justify-center select-none">
            <span className="font-bold leading-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: size === 220 ? "58px" : "72px",
                letterSpacing: "-2px",
                color: "var(--text-primary)",
              }}>
              {mins}:{secs}
            </span>
            <span className="text-sm mt-2" style={{ color: "var(--text-faint)" }}>
              {sessionMins} min session
            </span>
          </div>
        </div>

        <p className="text-sm italic" style={{ color: "var(--text-disabled)" }}>Stay locked in.</p>

        <div className="flex items-center justify-center gap-3 flex-wrap px-4">
          <button
            onClick={handlePause}
            disabled={completed}
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-30"
            style={{ border: "1px solid var(--border-base)", color: "var(--text-primary)", backgroundColor: "transparent" }}
            onMouseEnter={e => { if (!completed) { e.currentTarget.style.backgroundColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-primary)"; }}>
            {running ? "II Pause" : "▶ Resume"}
          </button>

          <button
            onClick={handleComplete}
            disabled={completed}
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-30"
            style={{ border: "1px solid var(--border-base)", color: "var(--text-primary)", backgroundColor: "transparent" }}
            onMouseEnter={e => { if (!completed) { e.currentTarget.style.backgroundColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-primary)"; }}>
            ✓ Done Early
          </button>

          <button
            onClick={handleAbandon}
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-all"
            style={{
              border: "1px solid #7f1d1d",
              color: "#f87171",
              backgroundColor: "rgba(239,68,68,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; }}>
            × Abandon
          </button>
        </div>
      </div>

      {celebration && (
        <CelebrationOverlay
          taskTitle={celebration.title}
          xpAwarded={celebration.xp}
          newStreak={celebration.newStreak}
          onClose={handleCelebrationClose}
        />
      )}
    </div>
  );
}