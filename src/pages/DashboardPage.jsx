import { useState } from "react";

import {
  Menu, Plus, Play, Clock, Star, Moon,
  Flame, Zap, Trophy, Rocket, PartyPopper,
} from "lucide-react";

const INITIAL_TASKS = [
  { id:1, title:"Finish project proposal draft", category:"work",   catColor:"#6C63FF", est:45, due:"Today",    priority:"high",   done:false, group:"today"    },
  { id:2, title:"Review pull request #43",        category:"Dev",    catColor:"#10B981", est:25, due:"Today",    priority:"medium", done:false, group:"today"    },
  { id:3, title:"Read chapter two of GET 203",    category:"study",  catColor:"#F59E0B", est:60, due:"Tomorrow", priority:"low",    done:false, group:"upcoming" },
  { id:4, title:"Gym session",                    category:"Health", catColor:"#EF4444", est:55, due:"Tomorrow", priority:"low",    done:false, group:"upcoming" },
];

const PRIORITY_COLOR = { high:"#EF4444", medium:"#F59E0B", low:"#22C55E" };
const STREAK_DAYS    = [true,false,false,false,false,false,false];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function AddTaskModal({ onClose, onAdd }) {
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("High");
  const [est,      setEst]      = useState("25");
  const [due,      setDue]      = useState("Today");
  const sel = { backgroundColor:"#1a1a1a", border:"1px solid #333", color:"#fff", width:"100%", borderRadius:"12px", padding:"10px 12px", fontSize:"14px", outline:"none" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:"rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-lg rounded-2xl p-8" style={{ backgroundColor:"#1a1a1a", border:"1px solid #6C63FF" }}>
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily:"'Syne',sans-serif" }}>Add New Task</h2>
        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to be done?"
          className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none mb-5"
          style={{ backgroundColor:"#111", border:"1px solid #333" }}
          onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#333"}/>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">CATEGORY</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} style={sel}>
              {["Work","Dev","Study","Personal","Health","Creative"].map(c=><option key={c} style={{ backgroundColor:"#1a1a1a" }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">PROPERTY</label>
            <div className="flex gap-2">
              {["Low","Medium","High"].map(p=>(
                <button key={p} onClick={()=>setPriority(p)} className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
                  style={{ backgroundColor:priority===p?(p==="High"?"#7C2D12":p==="Medium"?"#292408":"#052e16"):"#111", color:priority===p?(p==="High"?"#FCA5A5":p==="Medium"?"#FCD34D":"#86EFAC"):"#9CA3AF", border:`1px solid ${priority===p?"#444":"#333"}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">EST. TIME (MIN)</label>
            <input type="number" value={est} onChange={e=>setEst(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor:"#111", border:"1px solid #333" }} onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#333"}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">DUE</label>
            <select value={due} onChange={e=>setDue(e.target.value)} style={sel}>
              {["Today","Tomorrow","This week","Next week"].map(d=><option key={d} style={{ backgroundColor:"#1a1a1a" }}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>{if(title.trim()){onAdd({title,category,priority,est:parseInt(est),due});onClose();}}}
            className="flex-1 rounded-2xl py-3 text-sm font-bold text-white hover:opacity-90 transition-all" style={{ backgroundColor:"#6C63FF" }}>Add Task</button>
          <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-medium text-gray-400 hover:text-white transition-all"
            style={{ backgroundColor:"transparent", border:"1px solid #333" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CelebrationModal({ taskTitle, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:"rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-10 text-center" style={{ backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a" }}>
        <div className="flex justify-center mb-4"><PartyPopper size={56} color="#6C63FF"/></div>
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily:"'Syne',sans-serif", color:"#F59E0B" }}>WELL DONE!</h2>
        <p className="text-white text-base font-semibold mb-1">{taskTitle}</p>
        <p className="text-gray-400 text-sm mb-6 flex items-center justify-center gap-1">
          That's what you're made of! <Flame size={16} color="#F97316"/>
        </p>
        <div className="flex gap-3 justify-center mb-4">
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5" style={{ backgroundColor:"#6C63FF" }}>
            <Zap size={14}/> +75 XP
          </span>
          <span className="rounded-full px-4 py-2 text-sm font-bold text-white flex items-center gap-1.5" style={{ backgroundColor:"#064E3B" }}>
            <Flame size={14} color="#F97316"/> Streak +1
          </span>
        </div>
        <p className="text-gray-600 text-xs">Click anywhere to continue</p>
      </div>
    </div>
  );
}

function StreakLossModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:"rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-10 text-center" style={{ backgroundColor:"#1a1a1a", border:"1px solid #2a2a2a" }}>
        <div className="flex justify-center mb-5"><Flame size={48} color="#F97316"/></div>
        <h2 className="text-3xl font-bold text-white leading-snug mb-4" style={{ fontFamily:"'Syne',sans-serif" }}>
          One missed day<br/>doesn't erase what<br/>you built.
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          A streak is a measure of consistency, not worth rest when you need to. Come back when you are ready.
        </p>
        <button onClick={onClose} className="w-full rounded-2xl py-3 text-sm font-bold text-white mb-3 hover:opacity-90 transition-all" style={{ backgroundColor:"#6C63FF" }}>I'm Ready</button>
        <button onClick={onClose} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Maybe later</button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
      style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a", opacity:task.done?0.5:1 }}>
      <button onClick={()=>onToggle(task.id)}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{ borderColor:task.done?"#6C63FF":"#444", backgroundColor:task.done?"#6C63FF":"transparent" }}>
        {task.done&&<svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.done?"line-through text-gray-600":"text-white"}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor:task.catColor+"22", color:task.catColor }}>{task.category}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12}/> {task.est}min</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor:PRIORITY_COLOR[task.priority] }}/>
        <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white hover:opacity-80 transition-all" style={{ backgroundColor:"#6C63FF" }}>
          <Play size={11}/> Focus
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage({ onMenuOpen, user }) {
  const [tasks,          setTasks]         = useState(INITIAL_TASKS);
  const [showAdd,        setShowAdd]       = useState(false);
  const [celebration,    setCelebration]   = useState(null);
  const [showStreakLoss, setShowStreakLoss] = useState(false);


  const todayTasks    = tasks.filter(t=>t.group==="today");
  const upcomingTasks = tasks.filter(t=>t.group==="upcoming");
  const doneCount     = tasks.filter(t=>t.done).length;
  const totalCount    = tasks.length;

  const toggleTask = id => {
    const t = tasks.find(t=>t.id===id);
    if(t&&!t.done) setCelebration(t.title);
    setTasks(prev=>prev.map(t=>t.id===id?{...t,done:!t.done}:t));
  };

  const addTask = data => {
    setTasks(prev=>[...prev,{ id:Date.now(), title:data.title, category:data.category, catColor:"#6C63FF", est:data.est, due:data.due, priority:data.priority.toLowerCase(), done:false, group:data.due==="Today"?"today":"upcoming" }]);
  };

  const r=22, circ=2*Math.PI*r, pct=totalCount>0?doneCount/totalCount:0, dash=circ-pct*circ;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor:"#0a0a0a", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>



      <div className="sticky top-0 z-20 flex items-start justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor:"#0a0a0a", borderBottom:"1px solid #141414" }}>
        <div className="flex items-start gap-4">
          <button onClick={()=>{ onMenuOpen?.(); }} className="lg:hidden mt-1 text-gray-400 hover:text-white transition-colors">
            <Menu size={22}/>
          </button>
          <div>
            <p className="text-gray-500 text-xs">{getGreeting()}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily:"'Syne',sans-serif" }}>{user?.name??"Johnpaul3.0"}</h1>
            <p className="text-gray-400 text-xs mt-0.5">{todayTasks.filter(t=>!t.done).length} tasks left to conquer today.</p>
          </div>
        </div>
        <button onClick={()=>setShowAdd(true)}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all flex-shrink-0"
          style={{ backgroundColor:"#6C63FF" }}>
          <Plus size={16}/>
          <span className="hidden sm:inline">+ New Task</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
            <div>
              <p className="text-gray-400 text-xs font-semibold tracking-widest mb-2">TODAY'S TASKS</p>
              <p className="text-3xl font-bold text-white mb-1">{doneCount}<span className="text-gray-500 text-xl font-normal">/{totalCount}</span></p>
              <p className="text-gray-400 text-xs">tasks completed</p>
              <div className="h-0.5 w-24 rounded mt-3" style={{ backgroundColor:"#6C63FF" }}/>
            </div>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={r} fill="none" stroke="#2a2a2a" strokeWidth="4"/>
              <circle cx="28" cy="28" r={r} fill="none" stroke="#6C63FF" strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                transform="rotate(-90 28 28)" style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
            </svg>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
            <p className="text-gray-400 text-xs font-semibold tracking-widest mb-2">CURRENT STREAK</p>
            <p className="text-3xl font-bold text-white mb-1">8 <span className="text-gray-500 text-sm font-normal">days</span></p>
            <div className="flex gap-1.5 mt-3">
              {STREAK_DAYS.map((active,i)=>(
                <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor:active?"#431407":"#1f1f1f" }}>
                  {active && <Flame size={16} color="#F97316"/>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
            <p className="text-gray-400 text-xs font-semibold tracking-widest mb-2">XP EARNED TODAY</p>
            <p className="text-3xl font-bold mb-3" style={{ color:"#6C63FF" }}>+200 <span className="text-gray-500 text-sm font-normal">points</span></p>
            <div className="flex flex-wrap gap-2">
              {[
                { label:"Active",      Icon:Zap,      bg:"#1e1b4b", color:"#a78bfa" },
                { label:"On fire",     Icon:Trophy,   bg:"#431407", color:"#fb923c" },
                { label:"Crushing it", Icon:Rocket,   bg:"#1a1a1a", color:"#e5e7eb" },
              ].map(b=>(
                <span key={b.label} className="rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor:b.bg, color:b.color }}>
                  <b.Icon size={11}/> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Nudge */}
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
          <div className="flex items-center gap-3">
            <Star size={14} color="#6C63FF" fill="#6C63FF"/>
            <div>
              <p className="text-xs font-semibold tracking-widest mb-0.5" style={{ color:"#6C63FF" }}>DAILY NUDGE</p>
              <p className="text-white text-sm italic">"One task still counts. What is one thing"</p>
            </div>
          </div>
          <button className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 ml-4"><Moon size={16}/></button>
        </div>

        {/* Tasks + Up Next */}
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            {todayTasks.length>0&&(
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white text-sm font-bold">TODAY</span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor:"#2a2a2a" }}>{todayTasks.filter(t=>!t.done).length}</span>
                </div>
                <div className="space-y-2">{todayTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask}/>)}</div>
              </div>
            )}
            {upcomingTasks.length>0&&(
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white text-sm font-bold">UPCOMING</span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor:"#2a2a2a" }}>{upcomingTasks.filter(t=>!t.done).length}</span>
                </div>
                <div className="space-y-2">{upcomingTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask}/>)}</div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-64 flex-shrink-0">
            <p className="text-white text-sm font-bold mb-3">UP NEXT</p>
            <div className="space-y-2">
              {tasks.slice(0,4).map((item,i)=>(
                <div key={i} className="rounded-xl p-3" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
                  <p className="text-white text-xs font-semibold mb-1">{item.title}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor:PRIORITY_COLOR[item.priority] }}/>
                    {item.est}min · {item.due}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd&&<AddTaskModal onClose={()=>setShowAdd(false)} onAdd={addTask}/>}
      {celebration&&<CelebrationModal taskTitle={celebration} onClose={()=>setCelebration(null)}/>}
      {showStreakLoss&&<StreakLossModal onClose={()=>setShowStreakLoss(false)}/>}
    </div>
  );
}