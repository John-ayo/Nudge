import { useState, useEffect } from "react";
import {
  Menu, Plus, Pencil, Trash2, Check,
  Briefcase, Code2, BookOpen, User, Heart, Palette,
  Flame, Lightbulb, Music, Trophy, Leaf, Cpu,
  Cookie, Pizza, Wrench, Dumbbell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
  "#6C63FF","#10B981","#F59E0B","#EF4444","#06B6D4",
  "#F97316","#A78BFA","#EC4899","#14B8A6","#F472B6","#22C55E",
];

// Derive status label from task counts
function deriveStatus(total, done) {
  if (total === 0)         return "No tasks";
  if (done === total)      return "Complete";
  if (done === 0)          return "Just started";
  return "In progress";
}

function statusStyle(s) {
  if (s === "Complete")     return { bg: "#052e16", color: "#4ade80" };
  if (s === "Just started") return { bg: "#1c1407", color: "#fbbf24" };
  if (s === "No tasks")     return { bg: "#1a1a1a", color: "#6b7280" };
  return { bg: "#2d0f0f", color: "#f87171" };
}

function CategoryModal({ cat, onClose, onSave, saving }) {
  const [name,    setName]    = useState(cat?.name  ?? "");
  const [iconKey, setIconKey] = useState(cat?.icon  ?? "BookOpen");
  const [color,   setColor]   = useState(cat?.color ?? "#6C63FF");

  const PreviewIcon = ALL_ICONS[iconKey] || BookOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-7"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
        <h2 className="text-xl font-bold text-white mb-5"
          style={{ fontFamily: "'Syne',sans-serif" }}>
          {cat ? "Edit Category" : "New Category"}
        </h2>

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
          style={{ backgroundColor: "#111", border: "1px solid #2a2a2a" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color + "33" }}>
            <PreviewIcon size={20} color={color}/>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{name || "Preview"}</p>
            <p className="text-gray-500 text-xs">Preview</p>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">NAME</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. school project"
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
            style={{ backgroundColor: "#111", border: "1px solid #333" }}
            onFocus={e  => e.target.style.borderColor = "#6C63FF"}
            onBlur={e   => e.target.style.borderColor = "#333"}
          />
        </div>

        {/* Icon picker */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">ICON</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((item, i) => (
              <button key={item.key + i} onClick={() => setIconKey(item.key)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: iconKey === item.key ? color + "33" : "#111",
                  border: `1.5px solid ${iconKey === item.key ? color : "#2a2a2a"}`,
                }}>
                <item.Icon size={16} color={iconKey === item.key ? color : "#9CA3AF"}/>
              </button>
            ))}
          </div>
        </div>

        {/* Colour picker */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">COLOUR</label>
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
            style={{ backgroundColor: "#6C63FF" }}>
            {saving ? "Saving..." : cat ? "Save Changes" : "Create Category"}
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

function CategoryCard({ cat, onEdit, onDelete }) {
  const total   = cat._total ?? 0;
  const done    = cat._done  ?? 0;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const status  = deriveStatus(total, done);
  const st      = statusStyle(status);
  const CatIcon = ALL_ICONS[cat.icon] || BookOpen;

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:border-[#333]"
      style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cat.color + "22" }}>
            <CatIcon size={22} color={cat.color}/>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">{cat.name}</p>
            <p className="text-gray-500 text-xs">{total} task{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(cat)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-[#2a2a2a]"
            style={{ backgroundColor: "#1f1f1f", color: "#9CA3AF" }}>
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
          <span className="text-gray-400 text-xs">{done} / {total} done</span>
          <span className="text-xs font-bold" style={{ color: cat.color }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#2a2a2a" }}>
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

  const [cats,       setCats]       = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [saving,     setSaving]     = useState(false);

  // Fetch categories + tasks on mount
  useEffect(() => {
    if (!user) return;
    Promise.all([fetchCategories(user.id), fetchTasks(user.id)])
      .then(([cats, tasks]) => { setCats(cats); setTasks(tasks); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Enrich each category with task counts derived from tasks
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
    { label: `${cats.length} Categories`, bg: "#1e1b4b", color: "#a78bfa" },
    { label: `${totalTasks} Total Tasks`,  bg: "#1a1a1a", color: "#e5e7eb" },
    { label: `${totalDone} Completed`,     bg: "#052e16", color: "#4ade80" },
    { label: `${overallPct}% Done`,        bg: "#1c1407", color: "#fbbf24" },
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
      style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #141414" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => onMenuOpen?.()} className="lg:hidden text-gray-400 hover:text-white">
            <MenuIcon/>
          </button>
          <div>
            <p className="text-gray-500 text-xs tracking-widest font-medium">ORGANISE</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white"
              style={{ fontFamily: "'Syne',sans-serif" }}>Categories</h1>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#6C63FF" }}>
          <PlusIcon/>
          <span className="hidden sm:inline">New Category</span>
          {/* <span className="sm:hidden">+</span> */}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-400 border border-red-400/20"
            style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin"/>
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
                <CategoryCard key={cat.id} cat={cat} onEdit={setEditingCat} onDelete={handleDelete}/>
              ))}

              {/* Add new card */}
              <button onClick={() => setShowAdd(true)}
                className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-[#6C63FF]/40 min-h-[160px]"
                style={{ backgroundColor: "transparent", border: "2px dashed #2a2a2a" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#6C63FF" }}>
                  <Plus size={20} color="white"/>
                </div>
                <span className="text-gray-500 text-sm font-medium">New category</span>
              </button>
            </div>

            {/* Empty state */}
            {cats.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🗂️</div>
                <p className="text-white font-semibold text-lg mb-1">No categories yet</p>
                <p className="text-gray-500 text-sm">Create one to start organising your tasks.</p>
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