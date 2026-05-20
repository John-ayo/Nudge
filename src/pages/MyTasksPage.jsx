import { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/AuthContext";
import { fetchTasks, createTask, updateTask, deleteTask } from "../lib/tasks";
import { fetchCategories } from "../lib/categories";

const MenuIcon  = () => (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const PlusIcon  = () => (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const ClockIcon = () => (<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const EditIcon  = () => (<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const TrashIcon = () => (<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>);

const PRIORITY_COLOR = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };
const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

function TaskModal({ task, onClose, onSave, categories }) {
  const editing     = !!task;
  const [title,      setTitle]      = useState(task?.title       ?? "");
  const [priority,   setPriority]   = useState(task?.priority    ?? "high");
  const [est,        setEst]        = useState(task?.est         ?? 25);
  const [due,        setDue]        = useState(task?.due_date ? task.due_date.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(task?.category_id ?? "");

  const sel = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    color: "#fff",
    width: "100%",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-lg rounded-2xl p-8"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #6C63FF" }}>
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Syne',sans-serif" }}>
          {editing ? "Edit Task" : "Add New Task"}
        </h2>

        {/* Title */}
        <input
          type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none mb-5"
          style={{ backgroundColor: "#111", border: "1px solid #333" }}
          onFocus={e => e.target.style.borderColor = "#6C63FF"}
          onBlur={e  => e.target.style.borderColor = "#333"}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Priority */}
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
                  }}>
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Est time */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">EST. TIME (MIN)</label>
            <input
              type="number" value={est} onChange={e => setEst(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "#111", border: "1px solid #333" }}
              onFocus={e => e.target.style.borderColor = "#6C63FF"}
              onBlur={e  => e.target.style.borderColor = "#333"}
            />
          </div>
        </div>

        {/* Due date */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">DUE DATE</label>
          <input
            type="date" value={due} onChange={e => setDue(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            style={{ backgroundColor: "#111", border: "1px solid #333", colorScheme: "dark" }}
            onFocus={e => e.target.style.borderColor = "#6C63FF"}
            onBlur={e  => e.target.style.borderColor = "#333"}
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">CATEGORY</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            style={sel}
            onFocus={e => e.target.style.borderColor = "#6C63FF"}
            onBlur={e  => e.target.style.borderColor = "#333"}>
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
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
            style={{ backgroundColor: "#6C63FF" }}>
            {editing ? "Save Changes" : "Add Task"}
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

function TaskRow({ task, onToggle, onEdit, onDelete, hoveredId, setHoveredId, categories }) {
  const isHovered = hoveredId === task.id;
  const category  = categories.find(c => c.id === task.category_id);

  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
      style={{
        backgroundColor: isHovered ? "#1e1e1e" : "#161616",
        border: `1px solid ${isHovered ? "#333" : "#2a2a2a"}`,
        opacity: task.done ? 0.55 : 1,
      }}
      onMouseEnter={() => setHoveredId(task.id)}
      onMouseLeave={() => setHoveredId(null)}>

      {/* Toggle */}
      <button onClick={() => onToggle(task.id)}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{ borderColor: task.done ? "#6C63FF" : "#444", backgroundColor: task.done ? "#6C63FF" : "transparent" }}>
        {task.done && <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>

      {/* Priority bar */}
      <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}/>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${task.done ? "line-through text-gray-600" : "text-white"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-400"><ClockIcon/> {task.est ?? "?"}min</span>
          <span className="text-xs text-gray-400">
            {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
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

      {/* Actions */}
      <div className={`flex items-center gap-2 flex-shrink-0 transition-opacity duration-150 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <button onClick={() => onEdit(task)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-all"
          style={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
          <EditIcon/> Edit
        </button>
        <button onClick={() => onDelete(task.id)}
          className="rounded-xl p-1.5 transition-all hover:bg-red-950"
          style={{ backgroundColor: "#2a1a1a", border: "1px solid #7f1d1d" }}>
          <span style={{ color: "#EF4444" }}><TrashIcon/></span>
        </button>
      </div>
    </div>
  );
}

export default function MyTasksPage({ onMenuOpen }) {
  const { user } = useAuth();
  const [tasks,       setTasks]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [hoveredId,   setHoveredId]   = useState(null);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchTasks(user.id), fetchCategories(user.id)])
      .then(([tasks, cats]) => { setTasks(tasks); setCategories(cats); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t =>  t.done);
  const highPrio  = tasks.filter(t => t.priority === "high" && !t.done);
  const dueToday  = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date).toDateString() === new Date().toDateString();
  });

  const toggleTask = async (id) => {
    const task    = tasks.find(t => t.id === id);
    const updated = await updateTask(id, { done: !task.done });
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAdd = async (data) => {
    const newTask = await createTask(user.id, {
      title:       data.title,
      priority:    data.priority,
      est:         data.est,
      due_date:    data.due,
      category_id: data.category_id,
    });
    setTasks(prev => [newTask, ...prev]);
  };

  const handleEdit = async (data) => {
    const updated = await updateTask(editingTask.id, {
      title:       data.title,
      priority:    data.priority,
      due_date:    data.due,
      est:         data.est,
      category_id: data.category_id,
    });
    setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
    setEditingTask(null);
  };

  const PILLS = [
    { label: `${pending.length} Pending`,        bg: "#1a1225", color: "#a78bfa" },
    { label: `${highPrio.length} High Priority`, bg: "#2d0f0f", color: "#f87171" },
    { label: `${completed.length} Completed`,    bg: "#052e16", color: "#4ade80" },
    { label: `${dueToday.length} Due Today`,     bg: "#1c1407", color: "#fbbf24" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #141414" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => onMenuOpen?.()} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <MenuIcon/>
          </button>
          <div>
            <p className="text-gray-500 text-xs tracking-widest font-medium">ALL TASKS</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>My Tasks</h1>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#6C63FF" }}>
          <PlusIcon/>
          <span className="hidden sm:inline">New Task</span>
          {/* <span className="sm:hidden">+</span> */ }
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-400 border border-red-400/20"
            style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin"/>
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
                    <span className="text-white text-sm font-bold">PENDING</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#2a2a2a" }}>{pending.length}</span>
                  </div>
                </ScrollReveal>
                <div className="space-y-2">
                  {pending.map((t, i) => (
                    <ScrollReveal key={t.id} delay={(i % 10) * 50}>
                      <TaskRow task={t} onToggle={toggleTask} onEdit={setEditingTask} onDelete={handleDelete}
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
                    <span className="text-white text-sm font-bold">COMPLETED</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#2a2a2a" }}>{completed.length}</span>
                  </div>
                </ScrollReveal>
                <div className="space-y-2">
                  {completed.map((t, i) => (
                    <ScrollReveal key={t.id} delay={(i % 10) * 50}>
                      <TaskRow task={t} onToggle={toggleTask} onEdit={setEditingTask} onDelete={handleDelete}
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
                  <p className="text-white font-semibold text-lg mb-1">All clear!</p>
                  <p className="text-gray-500 text-sm">No tasks yet. Add one to get started.</p>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>

      {showAdd && (
        <TaskModal
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
          categories={categories}
        />
      )}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEdit}
          categories={categories}
        />
      )}
    </div>
  );
}