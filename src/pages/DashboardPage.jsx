import { useState, useEffect } from "react";
import {
  Menu, Plus, Play, Clock, Star, Moon,
  Flame, Zap, Trophy, Rocket, PartyPopper,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchTasks, createTask, updateTask } from "../lib/tasks";
import { fetchCategories } from "../lib/categories";
import { supabase } from "../lib/supabase";

const PRIORITY_COLOR = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };
const XP_MAP         = { low: 20, medium: 30, high: 45 };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function AddTaskModal({ onClose, onAdd, categories }) {
  const [title,      setTitle]      = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority,   setPriority]   = useState("high");
  const [est,        setEst]        = useState("25");
  const [due,        setDue]        = useState(new Date().toISOString().split("T")[0]);

  const sel = {
    backgroundColor: "#1a1a1a", border: "1px solid #333", color: "#fff",
    width: "100%", borderRadius: "12px", padding: "10px 12px", fontSize: "14px", outline: "none",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-lg rounded-2xl p-8"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #6C63FF" }}>
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Syne',sans-serif" }}>
          Add New Task
        </h2>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none mb-5"
          style={{ backgroundColor: "#111", border: "1px solid #333" }}
          onFocus={e => e.target.style.borderColor = "#6C63FF"}
          onBlur={e  => e.target.style.borderColor = "#333"}/>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">CATEGORY</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={sel}
              onFocus={e => e.target.style.borderColor = "#6C63FF"}
              onBlur={e  => e.target.style.borderColor = "#333"}>
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} style={{ backgroundColor: "#1a1a1a" }}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">PRIORITY</label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all"
                  style={{
                    backgroundColor: priority === p ? (p === "high" ? "#7C2D12" : p === "medium" ? "#292408" : "#052e16") : "#111",
                    color: priority === p ? (p === "high" ? "#FCA5A5" : p === "medium" ? "#FCD34D" : "#86EFAC") : "#9CA3AF",
                    border: `1px solid ${priority === p ? "#444" : "#333"}`,
                  }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">EST. TIME (MIN)</label>
            <input type="number" value={est} onChange={e => setEst(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "#111", border: "1px solid #333" }}
              onFocus={e => e.target.style.borderColor = "#6C63FF"}
              onBlur={e  => e.target.style.borderColor = "#333"}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">DUE DATE</label>
            <input type="date" value={due} onChange={e => setDue(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "#111", border: "1px solid #333", colorScheme: "dark" }}
              onFocus={e => e.target.style.borderColor = "#6C63FF"}
              onBlur={e  => e.target.style.borderColor = "#333"}/>
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
            style={{ backgroundColor: "#6C63FF" }}>
            Add Task
          </button>
          <button onClick={onClose}
            className="flex-1 rounded-2xl py-3 text-sm font-medium text-gray-400 hover:text-white transition-all"
            style={{ backgroundColor: "transparent", border: "1px solid #333" }}>
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
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <div className="flex justify-center mb-4"><PartyPopper size={56} color="#6C63FF"/></div>
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Syne',sans-serif", color: "#F59E0B" }}>
          WELL DONE!
        </h2>
        <p className="text-white text-base font-semibold mb-1">{taskTitle}</p>
        <p className="text-gray-400 text-sm mb-6 flex items-center justify-center gap-1">
          That's what you're made of! <Flame size={16} color="#F97316"/>
        </p>
        <div className="flex gap-3 justify-center mb-4">
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "#6C63FF" }}>
            <Zap size={14}/> +{xpAwarded} XP
          </span>
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5"
            style={{ backgroundColor: "#064E3B" }}>
            <Flame size={14} color="#F97316"/> {newStreak} day streak
          </span>
        </div>
        <p className="text-gray-600 text-xs">Click anywhere to continue</p>
      </div>
    </div>
  );
}

function StreakLossModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-10 text-center"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <div className="flex justify-center mb-5"><Flame size={48} color="#F97316"/></div>
        <h2 className="text-3xl font-bold text-white leading-snug mb-4"
          style={{ fontFamily: "'Syne',sans-serif" }}>
          One missed day<br/>doesn't erase what<br/>you built.
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          A streak is a measure of consistency, not worth. Rest when you need to. Come back when you are ready.
        </p>
        <button onClick={onClose}
          className="w-full rounded-2xl py-3 text-sm font-bold text-white mb-3 hover:opacity-90 transition-all"
          style={{ backgroundColor: "#6C63FF" }}>
          I'm Ready
        </button>
        <button onClick={onClose} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
      style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a", opacity: task.done ? 0.5 : 1 }}>
      <button onClick={() => onToggle(task)}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{ borderColor: task.done ? "#6C63FF" : "#444", backgroundColor: task.done ? "#6C63FF" : "transparent" }}>
        {task.done && <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>
      <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}/>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${task.done ? "line-through text-gray-600" : "text-white"}`}>
          {task.title}
        </p>
        <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
          <Clock size={10}/> {task.est ?? "?"}min
          {task.due_date && <span>· {new Date(task.due_date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
        </p>
      </div>
      {!task.done && (
        <button className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-all flex-shrink-0"
          style={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
          <Play size={10}/> Focus
        </button>
      )}
    </div>
  );
}

export default function DashboardPage({ onMenuOpen }) {
  const { user } = useAuth();

  const [tasks,          setTasks]          = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [totalXP,        setTotalXP]        = useState(0);
  const [streak,         setStreak]         = useState({ current: 0, best: 0 });
  const [loading,        setLoading]        = useState(true);
  const [showAdd,        setShowAdd]        = useState(false);
  const [celebration,    setCelebration]    = useState(null); // { title, xp, newStreak }
  const [showStreakLoss, setShowStreakLoss] = useState(false);

  // Initial data fetch
  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const [tasksData, catsData, xpData, streakData] = await Promise.all([
          fetchTasks(user.id),
          fetchCategories(user.id),
          supabase.from("xp_log").select("amount").eq("user_id", user.id),
          supabase.from("streaks").select("*").eq("user_id", user.id).single(),
        ]);

        setTasks(tasksData);
        setCategories(catsData);

        if (xpData.data) {
          setTotalXP(xpData.data.reduce((sum, row) => sum + (row.amount ?? 0), 0));
        }
        if (streakData.data) {
          setStreak(streakData.data);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // Realtime subscription on xp_log
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("xp_log_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "xp_log", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setTotalXP(prev => prev + (payload.new.amount ?? 0));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Compare YYYY-MM-DD strings directly to avoid timezone offset shifting dates
  const todayStr      = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"
  const todayTasks    = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) === todayStr);
  const upcomingTasks = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) !== todayStr && !t.done);
  const doneCount     = todayTasks.filter(t => t.done).length;
  const totalCount    = todayTasks.length;
  const r             = 22;
  const circ          = 2 * Math.PI * r;
  const dash          = totalCount > 0 ? circ * (1 - doneCount / totalCount) : circ;

  // Streak dot indicators - last 7 days relative to streak current
  const streakDots = Array.from({ length: 7 }, (_, i) => i < streak.current);

  const toggleTask = async (task) => {
    // Optimistically update UI
    const newDone = !task.done;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone } : t));

    try {
      // Update task in DB
      await updateTask(task.id, { done: newDone });

      // If completing the task, call edge function for XP + streak
      if (newDone) {
        const res = await supabase.functions.invoke("complete-task", {
          body: { task_id: task.id, user_id: user.id },
        });

        if (res.data) {
          const { xp_awarded, new_streak } = res.data;
          // Update streak state
          setStreak(prev => ({ ...prev, current: new_streak, best: Math.max(new_streak, prev.best) }));
          // Show celebration modal
          setCelebration({ title: task.title, xp: xp_awarded, newStreak: new_streak });
        }
      }
    } catch (err) {
      // Revert optimistic update on error
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: task.done } : t));
      console.error("Toggle task error:", err);
    }
  };

  const addTask = async (data) => {
    const newTask = await createTask(user.id, {
      title:       data.title,
      priority:    data.priority,
      est:         data.est,
      due_date:    data.due,      // tasks.js now reads due_date ?? due
      category_id: data.category_id,
    });
    setTasks(prev => [newTask, ...prev]);
  };

  const userName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "there";

  // XP today (from xp_log created_at = today)
  const todayXP = totalXP; // realtime keeps this live

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #141414" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => onMenuOpen?.()} className="lg:hidden text-gray-400 hover:text-white">
            <Menu size={22}/>
          </button>
          <div>
            <p className="text-gray-500 text-xs tracking-widest font-medium">{getGreeting()},</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
              {userName}
            </h1>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all flex-shrink-0"
          style={{ backgroundColor: "#6C63FF" }}>
          <Plus size={16}/>
          <span className="hidden sm:inline">New Task</span>
          {/* <span className="sm:hidden">+</span> */ }
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          {/* Today's tasks */}
          <div className="rounded-2xl p-5 flex items-center justify-between"
            style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
            <div>
              <p className="text-gray-400 text-xs font-semibold tracking-widest mb-2">TODAY'S TASKS</p>
              <p className="text-3xl font-bold text-white mb-1">
                {doneCount}<span className="text-gray-500 text-xl font-normal">/{totalCount}</span>
              </p>
              <p className="text-gray-400 text-xs">tasks completed</p>
              <div className="h-0.5 w-24 rounded mt-3" style={{ backgroundColor: "#6C63FF" }}/>
            </div>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={r} fill="none" stroke="#2a2a2a" strokeWidth="4"/>
              <circle cx="28" cy="28" r={r} fill="none" stroke="#6C63FF" strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                transform="rotate(-90 28 28)" style={{ transition: "stroke-dashoffset 0.5s ease" }}/>
            </svg>
          </div>

          {/* Streak */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
            <p className="text-gray-400 text-xs font-semibold tracking-widest mb-2">CURRENT STREAK</p>
            <p className="text-3xl font-bold text-white mb-1">
              {streak.current} <span className="text-gray-500 text-sm font-normal">days</span>
            </p>
            <div className="flex gap-1.5 mt-3">
              {streakDots.map((active, i) => (
                <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: active ? "#431407" : "#1f1f1f" }}>
                  {active && <Flame size={16} color="#F97316"/>}
                </div>
              ))}
            </div>
          </div>

          {/* XP */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
            <p className="text-gray-400 text-xs font-semibold tracking-widest mb-2">TOTAL XP</p>
            <p className="text-3xl font-bold mb-3" style={{ color: "#6C63FF" }}>
              +{totalXP} <span className="text-gray-500 text-sm font-normal">points</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Active",      Icon: Zap,    bg: "#1e1b4b", color: "#a78bfa" },
                { label: "On fire",     Icon: Trophy, bg: "#431407", color: "#fb923c" },
                { label: "Crushing it", Icon: Rocket, bg: "#1a1a1a", color: "#e5e7eb" },
              ].map(b => (
                <span key={b.label} className="rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: b.bg, color: b.color }}>
                  <b.Icon size={11}/> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Nudge */}
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
          style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
          <div className="flex items-center gap-3">
            <Star size={14} color="#6C63FF" fill="#6C63FF"/>
            <div>
              <p className="text-xs font-semibold tracking-widest mb-0.5" style={{ color: "#6C63FF" }}>DAILY NUDGE</p>
              <p className="text-white text-sm italic">"One task still counts. What is one thing you can do right now?"</p>
            </div>
          </div>
          <button className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 ml-4">
            <Moon size={16}/>
          </button>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 min-w-0">
              {todayTasks.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white text-sm font-bold">TODAY</span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#2a2a2a" }}>{todayTasks.filter(t => !t.done).length}</span>
                  </div>
                  <div className="space-y-2">
                    {todayTasks.map(t => <TaskRow key={t.id} task={t} onToggle={toggleTask}/>)}
                  </div>
                </div>
              )}
              {upcomingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white text-sm font-bold">UPCOMING</span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#2a2a2a" }}>{upcomingTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {upcomingTasks.map(t => <TaskRow key={t.id} task={t} onToggle={toggleTask}/>)}
                  </div>
                </div>
              )}
              {tasks.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-white font-semibold mb-1">No tasks yet</p>
                  <p className="text-gray-500 text-sm">Add your first task to get started.</p>
                </div>
              )}
            </div>

            {/* Up Next */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <p className="text-white text-sm font-bold mb-3">UP NEXT</p>
              <div className="space-y-2">
                {tasks.filter(t => !t.done).slice(0, 4).map((item, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
                    <p className="text-white text-xs font-semibold mb-1">{item.title}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: PRIORITY_COLOR[item.priority] }}/>
                      {item.est ?? "?"}min
                      {item.due_date && <span>· {new Date(item.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} categories={categories}/>}
      {celebration && (
        <CelebrationModal
          taskTitle={celebration.title}
          xpAwarded={celebration.xp}
          newStreak={celebration.newStreak}
          onClose={() => setCelebration(null)}
        />
      )}
      {showStreakLoss && <StreakLossModal onClose={() => setShowStreakLoss(false)}/>}
    </div>
  );
}