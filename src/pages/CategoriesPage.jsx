import { useState, useEffect } from "react";
import {
  Menu, Plus, Pencil, Trash2, Check,
  Briefcase, Code2, BookOpen, User, Heart, Palette,
  Flame, Lightbulb, Music, Trophy, Leaf, Cpu,
  Cookie, Pizza, Wrench, Dumbbell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAccent } from "../context/AccentContext";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../lib/categories";
import { fetchTasks } from "../lib/tasks";

const MenuIcon  = () => <Menu size={22}/>;
const PlusIcon  = () => <Plus size={16}/>;
const EditIcon  = () => <Pencil size={13}/>;
const TrashIcon = () => <Trash2 size={13}/>;
const CheckIcon = () => <Check size={10} strokeWidth={3}/>;

const ICON_OPTIONS = [
  { key: "BookOpen",  Icon: BookOpen  },
  { key: "Briefcase", Icon: Briefcase },
  { key: "Code2",     Icon: Code2     },
  { key: "Flame",     Icon: Flame     },
  { key: "Palette",   Icon: Palette   },
  { key: "Lightbulb", Icon: Lightbulb },
  { key: "Cookie",    Icon: Cookie    },
  { key: "Pizza",     Icon: Pizza     },
  { key: "Wrench",    Icon: Wrench    },
  { key: "Dumbbell",  Icon: Dumbbell  },
  { key: "Cpu",       Icon: Cpu       },
  { key: "Music",     Icon: Music     },
  { key: "Trophy",    Icon: Trophy    },
  { key: "Leaf",      Icon: Leaf      },
  { key: "Heart",     Icon: Heart     },
  { key: "User",      Icon: User      },
];

const ALL_ICONS = {
  Briefcase, Code2, BookOpen, User, Heart, Palette,
  Flame, Lightbulb, Cookie, Pizza, Wrench, Dumbbell,
  Cpu, Music, Trophy, Leaf,
};

const COLORS = [
  "var(--accent)","#10B981","#F59E0B","#EF4444","#06B6D4",
  "#F97316","#A78BFA","#EC4899","#14B8A6","#F472B6","#22C55E",
];

function deriveStatus(total, done) {
  if (total === 0)         return "No tasks";
  if (done === total)      return "Complete";
  if (done === 0)          return "Just started";
  return "In progress";
}

function statusStyle(s, theme) {
  if (s === "Complete")     return { bg: theme === "dark" ? "#052e16" : "#dcfce7", color: theme === "dark" ? "#4ade80" : "#15803d" };
  if (s === "Just started") return { bg: theme === "dark" ? "#1c1407" : "#fef9c3", color: theme === "dark" ? "#fbbf24" : "#92400e" };
  if (s === "No tasks")     return { bg: "var(--bg-card)",    color: "var(--text-faint)" };
  return                           { bg: theme === "dark" ? "#2d0f0f" : "#fee2e2", color: theme === "dark" ? "#f87171" : "#b91c1c" };
}

function CategoryModal({ cat, onClose, onSave, saving }) {
  const [name,    setName]    = useState(cat?.name  ?? "");
  const [iconKey, setIconKey] = useState(cat?.icon  ?? "BookOpen");
  const [color,   setColor]   = useState(cat?.color ?? "var(--accent)");

  const PreviewIcon = ALL_ICONS[iconKey] || BookOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-7"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
        <h2 className="text-xl font-bold mb-5"
          style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
          {cat ? "Edit Category" : "New Category"}
        </h2>

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
          style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-base)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color + "33" }}>
            <PreviewIcon size={20} color={color}/>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {name || "Preview"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>Preview</p>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2 tracking-widest"
            style={{ color: "var(--text-muted)" }}>NAME</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. school project"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-600"
            style={{
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-base)",
              color: "var(--text-primary)",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e  => e.target.style.borderColor = "var(--border-base)"}
          />
        </div>

        {/* Icon picker */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2 tracking-widest"
            style={{ color: "var(--text-muted)" }}>ICON</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((item, i) => (
              <button key={item.key + i} onClick={() => setIconKey(item.key)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: iconKey === item.key ? color + "33" : "var(--bg-input)",
                  border: `1.5px solid ${iconKey === item.key ? color : "var(--border-base)"}`,
                }}>
                <item.Icon size={16} color={iconKey === item.key ? color : "var(--text-muted)"}/>
              </button>
            ))}
          </div>
        </div>

        {/* Colour picker */}
        <div className="mb-6">
          <label className="block text-xs font-semibold mb-2 tracking-widest"
            style={{ color: "var(--text-muted)" }}>COLOUR</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: c,
                  border: color === c ? "2.5px solid #fff" : "2.5px solid transparent",
                }}>
                {color === c && <CheckIcon/>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={saving || !name.trim()}
            onClick={() => { if (name.trim()) onSave({ name, icon: iconKey, color }); }}
            className="flex-1 rounded-2xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}>
            {saving ? "Saving..." : cat ? "Save Changes" : "Create Category"}
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

function CategoryCard({ cat, onEdit, onDelete, theme }) {
  const total   = cat._total ?? 0;
  const done    = cat._done  ?? 0;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const status  = deriveStatus(total, done);
  const st      = statusStyle(status, theme);
  const CatIcon = ALL_ICONS[cat.icon] || BookOpen;

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:border-[var(--text-disabled)]"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cat.color + "22" }}>
            <CatIcon size={22} color={cat.color}/>
          </div>
          <div>
            <p className="font-bold text-base leading-tight" style={{ color: "var(--text-primary)" }}>
              {cat.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              {total} task{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(cat)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-subtle)]"
            style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
            <EditIcon/>
          </button>
          <button onClick={() => onDelete(cat.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-950"
            style={{ backgroundColor: "#2a1a1a", color: "#EF4444" }}>
            <TrashIcon/>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{done} / {total} done</span>
          <span className="text-xs font-bold" style={{ color: cat.color }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }}>
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: cat.color }}/>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1"
          style={{ backgroundColor: st.bg, color: st.color }}>
          {status === "Complete" && <Check size={10} strokeWidth={3}/>}
          {status}
        </span>
      </div>
    </div>
  );
}

export default function CategoriesPage({ onMenuOpen }) {
  const { user } = useAuth();
  const { theme } = useAccent();

  const [cats,       setCats]       = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchCategories(user.id), fetchTasks(user.id)])
      .then(([cats, tasks]) => { setCats(cats); setTasks(tasks); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const enrichedCats = cats.map(cat => {
    const catTasks = tasks.filter(t => t.category_id === cat.id);
    return {
      ...cat,
      _total: catTasks.length,
      _done:  catTasks.filter(t => t.done).length,
    };
  });

  const totalTasks = enrichedCats.reduce((s, c) => s + c._total, 0);
  const totalDone  = enrichedCats.reduce((s, c) => s + c._done,  0);
  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const PILLS = [
   {
      label: `${cats.length} Categories`,
      bg:    theme === "dark" ? "#1e1b4b" : "#ede9fe",
      color: theme === "dark" ? "#a78bfa" : "#6d28d9",
   },
   {
      label: `${totalTasks} Total Tasks`,
      bg:    theme === "dark" ? "var(--bg-card)" : "var(--bg-card)",
      color: "var(--text-primary)",
   },
   {
      label: `${totalDone} Completed`,
      bg:    theme === "dark" ? "#052e16" : "#dcfce7",
      color: theme === "dark" ? "#4ade80" : "#15803d",
   },
   {
      label: `${overallPct}% Done`,
      bg:    theme === "dark" ? "#1c1407" : "#fef9c3",
      color: theme === "dark" ? "#fbbf24" : "#92400e",
   },
 ];

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      const newCat = await createCategory(user.id, data);
      setCats(prev => [...prev, newCat]);
      setShowAdd(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      const updated = await updateCategory(editingCat.id, data);
      setCats(prev => prev.map(c => c.id === editingCat.id ? updated : c));
      setEditingCat(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--bg-subtle); border-radius: 4px; }
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
            <p className="text-xs tracking-widest font-medium" style={{ color: "var(--text-faint)" }}>
              ORGANISE
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold"
              style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
              Categories
            </h1>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "var(--accent)" }}>
          <PlusIcon/>
          <span className="hidden sm:inline">New Category</span>
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
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}/>
          </div>
        ) : (
          <>
            {/* Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {PILLS.map(p => (
                <span key={p.label} className="rounded-full px-4 py-1.5 text-xs font-semibold"
                  style={{ backgroundColor: p.bg, color: p.color }}>
                  {p.label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {enrichedCats.map(cat => (
                <CategoryCard key={cat.id} cat={cat} onEdit={setEditingCat} onDelete={handleDelete} theme={theme}/>
              ))}

              {/* Add new card */}
              <button onClick={() => setShowAdd(true)}
                className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-[var(--accent)] min-h-[160px]"
                style={{ backgroundColor: "transparent", border: "2px dashed var(--border-base)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent)" }}>
                  <Plus size={20} color="white"/>
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  New category
                </span>
              </button>
            </div>

            {/* Empty state */}
            {cats.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🗂️</div>
                <p className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                  No categories yet
                </p>
                <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                  Create one to start organising your tasks.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showAdd    && <CategoryModal onClose={() => setShowAdd(false)}    onSave={handleAdd}  saving={saving}/>}
      {editingCat && <CategoryModal cat={editingCat} onClose={() => setEditingCat(null)} onSave={handleEdit} saving={saving}/>}
    </div>
  );
}