import { useState } from "react";

import {
  Menu, Plus, Pencil, Trash2, Check,
  Briefcase, Code2, BookOpen, User, Heart, Palette,
  Flame, Lightbulb, Music, Trophy, Leaf, Cpu,
  Cookie, Pizza, Wrench, Dumbbell,
} from "lucide-react";

const MenuIcon  = () => <Menu size={22}/>;
const PlusIcon  = () => <Plus size={16}/>;
const EditIcon  = () => <Pencil size={13}/>;
const TrashIcon = () => <Trash2 size={13}/>;
const CheckIcon = () => <Check size={10} strokeWidth={3}/>;

// Icon map for category picker
const ICON_OPTIONS = [
  { key:"BookOpen",  Icon:BookOpen  },
  { key:"Flame",     Icon:Flame     },
  { key:"Palette",   Icon:Palette   },
  { key:"Lightbulb", Icon:Lightbulb },
  { key:"Cookie",    Icon:Cookie    },
  { key:"Pizza",     Icon:Pizza     },
  { key:"Wrench",    Icon:Wrench    },
  { key:"Dumbbell",  Icon:Dumbbell  },
  { key:"Lightbulb", Icon:Lightbulb },
  { key:"Cpu",       Icon:Cpu       },
  { key:"Music",     Icon:Music     },
  { key:"Trophy",    Icon:Trophy    },
  { key:"Leaf",      Icon:Leaf      },
  { key:"Code2",     Icon:Code2     },
];


const COLORS = ["#6C63FF","#10B981","#F59E0B","#EF4444","#06B6D4","#F97316","#A78BFA","#EC4899","#14B8A6","#F472B6","#22C55E"];

const INITIAL_CATS = [
  { id:1, name:"Work",     iconKey:"Briefcase", color:"#6C63FF", total:8, done:5, status:"In progress" },
  { id:2, name:"Dev",      iconKey:"Code2",     color:"#EC4899", total:9, done:5, status:"In progress" },
  { id:3, name:"Study",    iconKey:"BookOpen",  color:"#10B981", total:8, done:5, status:"In progress" },
  { id:4, name:"Personal", iconKey:"User",      color:"#EF4444", total:4, done:3, status:"In progress" },
  { id:5, name:"Health",   iconKey:"Heart",     color:"#F59E0B", total:5, done:5, status:"Complete"    },
  { id:6, name:"Creative", iconKey:"Palette",   color:"#22C55E", total:8, done:5, status:"Just started"},
];

const ALL_ICONS = {
  Briefcase, Code2, BookOpen, User, Heart, Palette,
  Flame, Lightbulb, Cookie, Pizza, Wrench, Dumbbell,
  Cpu, Music, Trophy, Leaf,
};


function statusStyle(s) {
  if (s==="Complete")     return { bg:"#052e16", color:"#4ade80" };
  if (s==="Just started") return { bg:"#1c1407", color:"#fbbf24" };
  return { bg:"#2d0f0f", color:"#f87171" };
}

function CategoryModal({ cat, onClose, onSave }) {
  const [name,    setName]    = useState(cat?.name    ?? "");
  const [iconKey, setIconKey] = useState(cat?.iconKey ?? "BookOpen");
  const [color,   setColor]   = useState(cat?.color   ?? "#6C63FF");

  const PreviewIcon = ALL_ICONS[iconKey] || BookOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:"rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-7" style={{ backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a" }}>
        <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily:"'Syne',sans-serif" }}>
          {cat ? "Edit Category" : "New Category"}
        </h2>

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5" style={{ backgroundColor:"#111", border:"1px solid #2a2a2a" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor:color+"33" }}>
            <PreviewIcon size={20} color={color}/>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{name||"Preview"}</p>
            <p className="text-gray-500 text-xs">Preview</p>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">NAME</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. school project"
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
            style={{ backgroundColor:"#111", border:"1px solid #333" }}
            onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#333"}/>
        </div>

        {/* Icon picker */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">ICON</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((item,i)=>(
              <button key={item.key+i} onClick={()=>setIconKey(item.key)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ backgroundColor:iconKey===item.key?color+"33":"#111", border:`1.5px solid ${iconKey===item.key?color:"#2a2a2a"}` }}>
                <item.Icon size={16} color={iconKey===item.key?color:"#9CA3AF"}/>
              </button>
            ))}
          </div>
        </div>

        {/* Colour picker */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">COLOUR</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ backgroundColor:c, border:color===c?"2.5px solid #fff":"2.5px solid transparent" }}>
                {color===c&&<CheckIcon/>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={()=>{ if(name.trim()){ onSave({name,iconKey,color}); onClose(); } }}
            className="flex-1 rounded-2xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all" style={{ backgroundColor:"#6C63FF" }}>
            {cat ? "Save Changes" : "Create Category"}
          </button>
          <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-medium text-gray-400 hover:text-white transition-all"
            style={{ backgroundColor:"transparent", border:"1px solid #333" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat, onEdit, onDelete }) {
  const pct     = cat.total>0 ? Math.round((cat.done/cat.total)*100) : 0;
  const st      = statusStyle(cat.status);
  const CatIcon = ALL_ICONS[cat.iconKey] || BookOpen;

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:border-[#333]"
      style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor:cat.color+"22" }}>
            <CatIcon size={22} color={cat.color}/>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">{cat.name}</p>
            <p className="text-gray-500 text-xs">{cat.total} tasks</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={()=>onEdit(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-[#2a2a2a]"
            style={{ backgroundColor:"#1f1f1f", color:"#9CA3AF" }}><EditIcon/></button>
          <button onClick={()=>onDelete(cat.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-950"
            style={{ backgroundColor:"#2a1a1a", color:"#EF4444" }}><TrashIcon/></button>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-400 text-xs">{cat.done} / {cat.total} done</span>
          <span className="text-xs font-bold" style={{ color:cat.color }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor:"#2a2a2a" }}>
          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width:`${pct}%`, backgroundColor:cat.color }}/>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1" style={{ backgroundColor:st.bg, color:st.color }}>
          {cat.status==="Complete"&&<Check size={10} strokeWidth={3}/>} {cat.status}
        </span>
        <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">click to view</button>
      </div>
    </div>
  );
}

export default function CategoriesPage({ onMenuOpen, user }) {
  const [cats,        setCats]        = useState(INITIAL_CATS);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editingCat,  setEditingCat]  = useState(null);


  const totalTasks = cats.reduce((s,c)=>s+c.total,0);
  const totalDone  = cats.reduce((s,c)=>s+c.done,0);
  const overallPct = totalTasks>0?Math.round((totalDone/totalTasks)*100):0;

  const deleteCat = id => setCats(prev=>prev.filter(c=>c.id!==id));
  const addCat    = data => setCats(prev=>[...prev,{id:Date.now(),...data,total:0,done:0,status:"Just started"}]);
  const saveEdit  = data => { setCats(prev=>prev.map(c=>c.id===editingCat.id?{...c,...data}:c)); setEditingCat(null); };

  const PILLS = [
    { label:`${cats.length} Categories`, bg:"#1e1b4b", color:"#a78bfa" },
    { label:`${totalTasks} Total Tasks`, bg:"#1a1a1a", color:"#e5e7eb" },
    { label:`${totalDone} Completed`,    bg:"#052e16", color:"#4ade80" },
    { label:`${overallPct}% Done`,       bg:"#1c1407", color:"#fbbf24" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor:"#0a0a0a", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>



      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor:"#0a0a0a", borderBottom:"1px solid #141414" }}>
        <div className="flex items-center gap-4">
          <button onClick={()=>{ onMenuOpen?.(); }} className="lg:hidden text-gray-400 hover:text-white"><MenuIcon/></button>
          <div>
            <p className="text-gray-500 text-xs tracking-widest font-medium">ORGANISE</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily:"'Syne',sans-serif" }}>Categories</h1>
          </div>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor:"#6C63FF" }}>
          <PlusIcon/><span className="hidden sm:inline">+ New Category</span><span className="sm:hidden">+</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {PILLS.map(p=>(
            <span key={p.label} className="rounded-full px-4 py-1.5 text-xs font-semibold" style={{ backgroundColor:p.bg, color:p.color }}>{p.label}</span>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cats.map(cat=>(
            <CategoryCard key={cat.id} cat={cat} onEdit={setEditingCat} onDelete={deleteCat}/>
          ))}
          <button onClick={()=>setShowAdd(true)}
            className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-[#6C63FF]/40 min-h-[160px]"
            style={{ backgroundColor:"transparent", border:"2px dashed #2a2a2a" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#6C63FF" }}>
              <Plus size={20} color="white"/>
            </div>
            <span className="text-gray-500 text-sm font-medium">New category</span>
          </button>
        </div>
      </div>

      {showAdd    && <CategoryModal onClose={()=>setShowAdd(false)} onSave={addCat}/>}
      {editingCat && <CategoryModal cat={editingCat} onClose={()=>setEditingCat(null)} onSave={saveEdit}/>}
    </div>
  );
}