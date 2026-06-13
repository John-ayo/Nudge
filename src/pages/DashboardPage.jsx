import { useState } from "react";
import {
  Menu, Plus, Play, Clock, Moon,
  Flame, Zap, Trophy, Rocket, PartyPopper,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TasksContext";
import { useAccent } from "../context/AccentContext";
import { useAffirmation } from "../hooks/useAffirmation";
import { trackCelebrationDismissed } from "../lib/analytics";

const PRIORITY_COLOR = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function AddTaskModal({ onClose, onAdd, categories, theme }) {
  const [title,      setTitle]      = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority,   setPriority]   = useState("high");
  const [est,        setEst]        = useState("25");
  const [due,        setDue]        = useState(new Date().toISOString().split("T")[0]);

  const sel = {
    backgroundColor: "var(--bg-input)",
    border: "1px solid var(--border-base)",
    color: "var(--text-primary)",
    width: "100%", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-lg rounded-2xl p-8"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--accent)" }}>
        <h2 className="text-xl font-bold mb-6"
          style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
          Add New Task
        </h2>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none mb-5"
          style={{
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-base)",
            color: "var(--text-primary)",
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-widest"
              style={{ color: "var(--text-muted)" }}>CATEGORY</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={sel}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e  => e.target.style.borderColor = "var(--border-base)"}>
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}
                  style={{ backgroundColor: "var(--bg-card)" }}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-widest"
              style={{ color: "var(--text-muted)" }}>PRIORITY</label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all"
                  style={{
                    backgroundColor: priority === p ? (p === "high" ? "#7C2D12" : p === "medium" ? "#292408" : "#052e16") : "var(--bg-input)",
                    color: priority === p ? (p === "high" ? "#FCA5A5" : p === "medium" ? "#FCD34D" : "#86EFAC") : "var(--text-muted)",
                    border: `1px solid ${priority === p ? "var(--border-base)" : "var(--border-subtle)"}`,
                  }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-widest"
              style={{ color: "var(--text-muted)" }}>EST. TIME (MIN)</label>
            <input type="number" value={est} onChange={e => setEst(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-base)",
                color: "var(--text-primary)",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-widest"
              style={{ color: "var(--text-muted)" }}>DUE DATE</label>
            <input type="date" value={due} onChange={e => setDue(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-base)",
                color: "var(--text-primary)",
                colorScheme: theme,
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd({ title, priority, est: parseInt(est), due, category_id: categoryId || null });
                onClose();
              }
            }}
            className="flex-1 rounded-2xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: "var(--accent)" }}>
            Add Task
          </button>
          <button onClick={onClose}
            className="flex-1 rounded-2xl py-3 text-sm font-medium transition-all"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-base)",
              color: "var(--text-muted)",
            }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CelebrationModal({ taskTitle, xpAwarded, newStreak, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-10 text-center"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
        <div className="flex justify-center mb-4"><PartyPopper size={56} color="var(--accent)"/></div>
        <h2 className="text-4xl font-bold mb-2"
          style={{ fontFamily: "'Syne',sans-serif", color: "#F59E0B" }}>
          WELL DONE!
        </h2>
        <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{taskTitle}</p>
        <p className="text-sm mb-6 flex items-center justify-center gap-1" style={{ color: "var(--text-muted)" }}>
          That's what you're made of! <Flame size={16} color="#F97316"/>
        </p>
        <div className="flex gap-3 justify-center mb-4">
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "var(--accent)" }}>
            <Zap size={14}/> +{xpAwarded} XP
          </span>
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "#064E3B" }}>
            <Flame size={14} color="#F97316"/> {newStreak} day streak
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-disabled)" }}>Click anywhere to continue</p>
      </div>
    </div>
  );
}

function StreakLossModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-10 text-center"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
        <div className="flex justify-center mb-5"><Flame size={48} color="#F97316"/></div>
        <h2 className="text-3xl font-bold leading-snug mb-4"
          style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
          One missed day<br/>doesn't erase what<br/>you built.
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          A streak is a measure of consistency, not worth. Rest when you need to. Come back when you are ready.
        </p>
        <button onClick={onClose}
          className="w-full rounded-2xl py-3 text-sm font-bold text-white mb-3 hover:opacity-90 transition-all"
          style={{ backgroundColor: "var(--accent)" }}>
          I'm Ready
        </button>
        <button onClick={onClose} className="text-sm transition-colors"
          style={{ color: "var(--text-faint)" }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onFocus }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-base)",
        opacity: task.done ? 0.5 : 1,
      }}>
      <button onClick={() => onToggle(task)}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          borderColor: task.done ? "var(--accent)" : "var(--bg-subtle)",
          backgroundColor: task.done ? "var(--accent)" : "transparent",
        }}>
        {task.done && <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>
      <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}/>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${task.done ? "line-through" : ""}`}
          style={{ color: task.done ? "var(--text-disabled)" : "var(--text-primary)" }}>
          {task.title}
        </p>
        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
          <Clock size={10}/> {task.est ?? "?"}min
          {task.due_date && <span>· {new Date(task.due_date.slice(0, 10) + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
        </p>
      </div>
      {!task.done && (
        <button onClick={() => onFocus(task)}
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all flex-shrink-0"
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-base)",
            color: "var(--text-muted)",
          }}>
          <Play size={10}/> Focus
        </button>
      )}
    </div>
  );
}

export default function DashboardPage({ onMenuOpen }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { theme }  = useAccent();
  const {
    tasks, categories, totalXP, streak,
    loading, toggleTask, addTask,
  } = useTasks();

  const { message: affirmation, Icon: AffirmIcon, color: affirmColor, refresh: refreshAffirmation } = useAffirmation();

  const [celebration,    setCelebration]    = useState(null);
  const [showAdd,        setShowAdd]        = useState(false);
  const [showStreakLoss, setShowStreakLoss] = useState(false);

  const handleToggle = (task) => toggleTask(task, (data) => setCelebration(data));
  const handleCelebrationClose = () => {
    trackCelebrationDismissed({ xp: celebration.xp, streak: celebration.newStreak, page: "dashboard" });
    setCelebration(null);
  };
  const handleFocus = (task) => navigate("/focus", { state: { task } });
  const handleAdd   = async (data) => await addTask({ ...data, due_date: data.due });

  const todayStr      = new Date().toLocaleDateString("en-CA");
  const todayTasks    = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) === todayStr);
  const upcomingTasks = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) !== todayStr && !t.done);
  const doneCount     = todayTasks.filter(t => t.done).length;
  const totalCount    = todayTasks.length;
  const r             = 22;
  const circ          = 2 * Math.PI * r;
  const dash          = totalCount > 0 ? circ * (1 - doneCount / totalCount) : circ;
  const streakDots    = Array.from({ length: 7 }, (_, i) => i < streak.current);
  const userName      = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:var(--bg-subtle);border-radius:4px;}
      `}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor: "var(--bg-base)", borderBottom: "1px solid var(--border-strong)" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => onMenuOpen?.()} className="lg:hidden transition-colors"
            style={{ color: "var(--text-muted)" }}>
            <Menu size={22}/>
          </button>
          <div>
            <p className="text-xs tracking-widest font-medium" style={{ color: "var(--text-faint)" }}>
              {getGreeting()},
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
              {userName}
            </h1>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all flex-shrink-0"
          style={{ backgroundColor: "var(--accent)" }}>
          <Plus size={16}/>
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          {/* Today's Tasks */}
          <div className="rounded-2xl p-5 flex items-center justify-between"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
            <div>
              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                TODAY'S TASKS
              </p>
              <p className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {doneCount}
                <span className="text-xl font-normal" style={{ color: "var(--text-faint)" }}>/{totalCount}</span>
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>tasks completed</p>
              <div className="h-0.5 w-24 rounded mt-3" style={{ backgroundColor: "var(--accent)" }}/>
            </div>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="4"/>
              <circle cx="28" cy="28" r={r} fill="none" stroke="var(--accent)" strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                transform="rotate(-90 28 28)" style={{ transition: "stroke-dashoffset 0.5s ease" }}/>
            </svg>
          </div>

          {/* Streak */}
          <div className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              CURRENT STREAK
            </p>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {streak.current}{" "}
              <span className="text-sm font-normal" style={{ color: "var(--text-faint)" }}>days</span>
            </p>
            <div className="flex gap-1.5 mt-3">
              {streakDots.map((active, i) => (
                <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: active ? "#431407" : "var(--bg-hover)" }}>
                  {active && <Flame size={16} color="#F97316"/>}
                </div>
              ))}
            </div>
          </div>

          {/* Total XP */}
          <div className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              TOTAL XP
            </p>
            <p className="text-3xl font-bold mb-3" style={{ color: "var(--accent)" }}>
              +{totalXP}{" "}
              <span className="text-sm font-normal" style={{ color: "var(--text-faint)" }}>points</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Active",      Icon: Zap,    bg: "#1e1b4b", color: "#a78bfa" },
                { label: "On fire",     Icon: Trophy, bg: "#431407", color: "#fb923c" },
                { label: "Crushing it", Icon: Rocket, bg: "var(--bg-hover)", color: "var(--text-muted)" },
              ].map(b => (
                <span key={b.label} className="rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: b.bg, color: b.color }}>
                  <b.Icon size={11}/> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Affirmation Card */}
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
          <div className="flex items-center gap-3">
            <AffirmIcon size={14} color={affirmColor} fill={affirmColor}/>
            <div>
              <p className="text-xs font-semibold tracking-widest mb-0.5" style={{ color: affirmColor }}>
                DAILY NUDGE
              </p>
              <p className="text-sm italic" style={{ color: "var(--text-primary)" }}>"{affirmation}"</p>
            </div>
          </div>
          <button onClick={refreshAffirmation} title="Get a new nudge"
            className="transition-colors flex-shrink-0 ml-4"
            style={{ color: "var(--text-disabled)" }}>
            <Moon size={16}/>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}/>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 min-w-0">
              {todayTasks.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>TODAY</span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--bg-subtle)" }}>
                      {todayTasks.filter(t => !t.done).length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {todayTasks.map(t => (
                      <TaskRow key={t.id} task={t} onToggle={handleToggle} onFocus={handleFocus}/>
                    ))}
                  </div>
                </div>
              )}

              {upcomingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>UPCOMING</span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--bg-subtle)" }}>
                      {upcomingTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {upcomingTasks.map(t => (
                      <TaskRow key={t.id} task={t} onToggle={handleToggle} onFocus={handleFocus}/>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
                    <rect x="20" y="120" width="140" height="6" rx="3" fill="var(--bg-hover)"/>
                    <rect x="45" y="72" width="60" height="50" rx="6" fill="var(--bg-card)" stroke="var(--border-base)" strokeWidth="1.5"/>
                    <rect x="45" y="72" width="8" height="50" rx="3" fill="var(--bg-subtle)"/>
                    <line x1="62" y1="90" x2="95" y2="90" stroke="var(--bg-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="62" y1="100" x2="95" y2="100" stroke="var(--bg-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="62" y1="110" x2="82" y2="110" stroke="var(--bg-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="120" cy="85" r="28" fill="var(--bg-hover)" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2"/>
                    <line x1="120" y1="74" x2="120" y2="96" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="109" y1="85" x2="131" y2="85" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
                    <g transform="rotate(-35 75 68)">
                      <rect x="68" y="44" width="8" height="28" rx="2" fill="var(--bg-subtle)"/>
                      <polygon points="68,72 76,72 72,82" fill="#F59E0B"/>
                      <rect x="68" y="44" width="8" height="6" rx="2" fill="var(--border-base)"/>
                    </g>
                    <circle cx="30" cy="65" r="3" fill="var(--accent)" opacity="0.4"/>
                    <circle cx="155" cy="60" r="2" fill="var(--accent)" opacity="0.3"/>
                    <circle cx="148" cy="115" r="2.5" fill="#F59E0B" opacity="0.3"/>
                    <circle cx="35" cy="108" r="2" fill="#22C55E" opacity="0.3"/>
                    <path d="M160 75 L162 70 L164 75 L162 80 Z" fill="var(--accent)" opacity="0.5"/>
                    <path d="M22 80 L24 76 L26 80 L24 84 Z" fill="#F59E0B" opacity="0.4"/>
                  </svg>
                  <h3 className="text-xl font-bold mb-2"
                    style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
                    Nothing here yet
                  </h3>
                  <p className="text-sm mb-8 text-center max-w-xs leading-relaxed" style={{ color: "var(--text-faint)" }}>
                    Your first task is the hardest one to add. Everything after that gets easier.
                  </p>
                  <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: "var(--accent)" }}>
                    <Plus size={16}/> Add your first task
                  </button>
                </div>
              )}
            </div>

            <div className="w-full lg:w-64 flex-shrink-0">
              <p className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>UP NEXT</p>
              <div className="space-y-2">
                {tasks.filter(t => !t.done).slice(0, 4).map((item, i) => (
                  <div key={i} className="rounded-xl p-3"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: PRIORITY_COLOR[item.priority] }}/>
                      {item.est ?? "?"}min
                      {item.due_date && <span>· {new Date(item.due_date.slice(0, 10) + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          categories={categories}
          theme={theme}
        />
      )}
      {celebration && (
        <CelebrationModal
          taskTitle={celebration.title}
          xpAwarded={celebration.xp}
          newStreak={celebration.newStreak}
          onClose={handleCelebrationClose}
        />
      )}
      {showStreakLoss && <StreakLossModal onClose={() => setShowStreakLoss(false)}/>}
    </div>
  );
}