import { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useTasks } from "../context/TasksContext";
import { useAccent } from "../context/AccentContext";
import { PartyPopper, Flame, Zap } from "lucide-react";

const MenuIcon  = () => (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const PlusIcon  = () => (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const ClockIcon = () => (<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const EditIcon  = () => (<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const TrashIcon = () => (<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>);

const PRIORITY_COLOR = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };
const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

function TaskModal({ task, onClose, onSave, categories, theme }) {
  const editing     = !!task;
  const [title,      setTitle]      = useState(task?.title       ?? "");
  const [priority,   setPriority]   = useState(task?.priority    ?? "high");
  const [est,        setEst]        = useState(task?.est         ?? 25);
  const [due,        setDue]        = useState(task?.due_date ? task.due_date.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(task?.category_id ?? "");

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
          {editing ? "Edit Task" : "Add New Task"}
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
              style={{ color: "var(--text-muted)" }}>PRIORITY</label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all"
                  style={{
                    backgroundColor: priority === p ? (p === "high" ? "#7C2D12" : p === "medium" ? "#292408" : "#052e16") : "var(--bg-input)",
                    color: priority === p ? (p === "high" ? "#FCA5A5" : p === "medium" ? "#FCD34D" : "#86EFAC") : "var(--text-muted)",
                    border: `1px solid ${priority === p ? "var(--border-base)" : "var(--border-subtle)"}`,
                  }}>
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

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
        </div>

        <div className="mb-4">
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

        <div className="mb-6">
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

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (title.trim()) {
                onSave({ title, priority, est: parseInt(est), due, category_id: categoryId || null });
                onClose();
              }
            }}
            className="flex-1 rounded-2xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: "var(--accent)" }}>
            {editing ? "Save Changes" : "Add Task"}
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

function TaskRow({ task, onToggle, onEdit, onDelete, hoveredId, setHoveredId, categories }) {
  const isHovered = hoveredId === task.id;
  const category  = categories.find(c => c.id === task.category_id);

  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
      style={{
        backgroundColor: isHovered ? "var(--bg-hover)" : "var(--bg-card)",
        border: `1px solid ${isHovered ? "var(--border-base)" : "var(--border-subtle)"}`,
        opacity: task.done ? 0.55 : 1,
      }}
      onMouseEnter={() => setHoveredId(task.id)}
      onMouseLeave={() => setHoveredId(null)}>

      <button onClick={() => onToggle(task.id)}
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
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <ClockIcon/> {task.est ?? "?"}min
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {task.due_date ? new Date(task.due_date.slice(0, 10) + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
          </span>
          <span className="text-xs font-semibold" style={{ color: PRIORITY_COLOR[task.priority] }}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {category && (
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: category.color + "22", color: category.color }}>
              {category.name}
            </span>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-2 flex-shrink-0 transition-opacity duration-150 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <button onClick={() => onEdit(task)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-base)",
            color: "var(--text-muted)",
          }}>
          <EditIcon/> Edit
        </button>
        <button onClick={() => onDelete(task.id)}
          className="rounded-xl p-1.5 transition-all hover:bg-red-950"
          style={{ backgroundColor: "#2d0f0f", border: "1px solid #7f1d1d" }}>
          <span style={{ color: "#EF4444" }}><TrashIcon/></span>
        </button>
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

export default function MyTasksPage({ onMenuOpen }) {
  const { tasks, categories, loading, toggleTask, addTask, editTask, removeTask } = useTasks();
  const { theme } = useAccent();

  const [showAdd,     setShowAdd]     = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [hoveredId,   setHoveredId]   = useState(null);
  const [error,       setError]       = useState("");
  const [celebration, setCelebration] = useState(null);

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t =>  t.done);
  const highPrio  = tasks.filter(t => t.priority === "high" && !t.done);
  const dueToday  = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date.slice(0, 10) + "T12:00:00").toDateString() === new Date().toDateString();
  });

  const handleToggle = (id) => toggleTask(id, (data) => setCelebration(data));
  const handleEdit   = async (data) => { try { await editTask(editingTask.id, data); setEditingTask(null); } catch (err) { setError(err.message); } };
  const handleAdd    = async (data) => { try { await addTask(data); } catch (err) { setError(err.message); } };
  const handleDelete = async (id)   => { try { await removeTask(id); } catch (err) { setError(err.message); } };

  const PILLS = [
    { label: `${pending.length} Pending`,        bg: "#1a1225", color: "#a78bfa" },
    { label: `${highPrio.length} High Priority`, bg: "#2d0f0f", color: "#f87171" },
    { label: `${completed.length} Completed`,    bg: "#052e16", color: "#4ade80" },
    { label: `${dueToday.length} Due Today`,     bg: "#1c1407", color: "#fbbf24" },
  ];

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
            <MenuIcon/>
          </button>
          <div>
            <p className="text-xs tracking-widest font-medium" style={{ color: "var(--text-faint)" }}>ALL TASKS</p>
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
              My Tasks
            </h1>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "var(--accent)" }}>
          <PlusIcon/>
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm border"
            style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}/>
          </div>
        ) : (
          <>
            <ScrollReveal>
              <div className="flex flex-wrap gap-2 mb-6">
                {PILLS.map(p => (
                  <span key={p.label} className="rounded-full px-4 py-1.5 text-xs font-semibold"
                    style={{ backgroundColor: p.bg, color: p.color }}>{p.label}</span>
                ))}
              </div>
            </ScrollReveal>

            {pending.length > 0 && (
              <div className="mb-6">
                <ScrollReveal>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>PENDING</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-primary)" }}>
                      {pending.length}
                    </span>
                  </div>
                </ScrollReveal>
                <div className="space-y-2">
                  {pending.map((t, i) => (
                    <ScrollReveal key={t.id} delay={(i % 10) * 50}>
                      <TaskRow task={t} onToggle={handleToggle} onEdit={setEditingTask} onDelete={handleDelete}
                        hoveredId={hoveredId} setHoveredId={setHoveredId} categories={categories}/>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <ScrollReveal>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>COMPLETED</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-primary)" }}>
                      {completed.length}
                    </span>
                  </div>
                </ScrollReveal>
                <div className="space-y-2">
                  {completed.map((t, i) => (
                    <ScrollReveal key={t.id} delay={(i % 10) * 50}>
                      <TaskRow task={t} onToggle={handleToggle} onEdit={setEditingTask} onDelete={handleDelete}
                        hoveredId={hoveredId} setHoveredId={setHoveredId} categories={categories}/>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <ScrollReveal>
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>All clear!</p>
                  <p className="text-sm" style={{ color: "var(--text-faint)" }}>No tasks yet. Add one to get started.</p>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>

      {showAdd && (
        <TaskModal onClose={() => setShowAdd(false)} onSave={handleAdd} categories={categories} theme={theme}/>
      )}
      {editingTask && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(null)} onSave={handleEdit} categories={categories} theme={theme}/>
      )}
      {celebration && (
        <CelebrationModal
          taskTitle={celebration.title}
          xpAwarded={celebration.xp}
          newStreak={celebration.newStreak}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}