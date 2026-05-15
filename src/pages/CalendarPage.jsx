import { useState } from "react";


const MenuIcon      = () => (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const PlusIcon      = () => (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const ChevLeftIcon  = () => (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>);
const ChevRightIcon = () => (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>);

const CATEGORIES = [
  { name:"Work",     color:"#6C63FF" },
  { name:"Dev",      color:"#EC4899" },
  { name:"Study",    color:"#10B981" },
  { name:"Personal", color:"#8B5CF6" },
  { name:"Health",   color:"#F59E0B" },
  { name:"Creative", color:"#22C55E" },
];

const TASKS_BY_DATE = {
  "2026-05-03": [{ id:1, title:"Finish project proposal draft", category:"work",   catColor:"#6C63FF", done:false, priority:"high"   }],
  "2026-05-06": [
    { id:2, title:"Finish project proposal draft", category:"work",   catColor:"#6C63FF", done:false, priority:"high"   },
    { id:3, title:"Review pull request #42",        category:"Dev",    catColor:"#EC4899", done:false, priority:"medium" },
    { id:4, title:"Reply to client emails",         category:"work",   catColor:"#6C63FF", done:true,  priority:"medium" },
    { id:5, title:"Debug Api endpoint",             category:"Dev",    catColor:"#EC4899", done:false, priority:"high"   },
  ],
  "2026-05-12": [{ id:6, title:"Read chapter three of GET 203", category:"Study",  catColor:"#10B981", done:false, priority:"low"    }],
  "2026-05-20": [
    { id:7, title:"Gym session",    category:"Health",   catColor:"#F59E0B", done:false, priority:"low"    },
    { id:8, title:"Create client UI", category:"Creative", catColor:"#22C55E", done:false, priority:"medium" },
  ],
};

const MONTH_NAMES    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES      = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const PRIORITY_COLOR = { high:"#EF4444", medium:"#F59E0B", low:"#22C55E" };
const CAT_COLORS     = { Work:"#6C63FF", Dev:"#EC4899", Study:"#10B981", Personal:"#8B5CF6", Health:"#F59E0B", Creative:"#22C55E" };

function toKey(y,m,d) { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function daysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function firstDay(y,m)    { return new Date(y,m,1).getDay(); }

function AddTaskModal({ date, onClose, onAdd }) {
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("medium");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:"rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-md rounded-2xl p-7" style={{ backgroundColor:"#1a1a1a", border:"1px solid #6C63FF" }}>
        <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily:"'Syne',sans-serif" }}>Add Task</h2>
        <p className="text-gray-500 text-xs mb-5">{date}</p>
        <input type="text" value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none mb-4"
          style={{ backgroundColor:"#111", border:"1px solid #333" }}
          onFocus={e=>e.target.style.borderColor="#6C63FF"} onBlur={e=>e.target.style.borderColor="#333"}
        />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">CATEGORY</label>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor:"#111", border:"1px solid #333" }}>
              {["Work","Dev","Study","Personal","Health","Creative"].map(c=>(
                <option key={c} style={{ backgroundColor:"#1a1a1a" }}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest">PRIORITY</label>
            <div className="flex gap-1.5">
              {["low","medium","high"].map(p=>(
                <button key={p} onClick={()=>setPriority(p)}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all"
                  style={{ backgroundColor:priority===p?PRIORITY_COLOR[p]+"33":"#111", color:priority===p?PRIORITY_COLOR[p]:"#9CA3AF", border:`1px solid ${priority===p?PRIORITY_COLOR[p]:"#333"}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>{ if(title.trim()){ onAdd(date,{title,category,priority}); onClose(); } }}
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all" style={{ backgroundColor:"#6C63FF" }}>Add Task</button>
          <button onClick={onClose} className="flex-1 rounded-2xl py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-all"
            style={{ backgroundColor:"transparent", border:"1px solid #333" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage({ onMenuOpen, user }) {
  const today = new Date();
  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [selected,    setSelected]    = useState(toKey(today.getFullYear(),today.getMonth(),today.getDate()));
  const [view,        setView]        = useState("month");
  const [tasks,       setTasks]       = useState(TASKS_BY_DATE);
  const [showAdd,     setShowAdd]     = useState(false);


  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const cells = [...Array(firstDay(year,month)).fill(null), ...Array.from({length:daysInMonth(year,month)},(_,i)=>i+1)];
  const selectedTasks = tasks[selected] ?? [];

  const formatSelected = () => {
    const d = new Date(selected+"T00:00:00");
    return d.toLocaleDateString("en-US",{weekday:"long",day:"numeric",month:"long"});
  };

  const addTask = (dateKey,data) => {
    setTasks(prev=>({...prev,[dateKey]:[...(prev[dateKey]??[]),{id:Date.now(),title:data.title,category:data.category,catColor:CAT_COLORS[data.category]??"#6C63FF",done:false,priority:data.priority}]}));
  };

  const toggleTask = (dateKey,id) => {
    setTasks(prev=>({...prev,[dateKey]:(prev[dateKey]??[]).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor:"#0a0a0a", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>



      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 lg:px-8 py-5"
        style={{ backgroundColor:"#0a0a0a", borderBottom:"1px solid #141414" }}>
        <div className="flex items-center gap-4">
          <button onClick={()=>{ onMenuOpen?.(); }} className="lg:hidden text-gray-400 hover:text-white"><MenuIcon/></button>
          <div>
            <p className="text-gray-500 text-xs tracking-widest font-medium">SCHEDULE</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily:"'Syne',sans-serif" }}>Calendar</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
          {["month","week"].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{ backgroundColor:view===v?"#6C63FF":"transparent", color:view===v?"#fff":"#9CA3AF" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
        {/* Calendar */}
        <div className="flex-1 px-5 lg:px-8 py-6 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>
              <span className="text-white">{MONTH_NAMES[month]}</span>
              <span className="text-gray-500 ml-2">{year}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-all" style={{ border:"1px solid #2a2a2a" }}><ChevLeftIcon/></button>
              <button onClick={()=>{ setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(toKey(today.getFullYear(),today.getMonth(),today.getDate())); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:bg-[#1f1f1f] transition-all" style={{ border:"1px solid #2a2a2a" }}>Today</button>
              <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-all" style={{ border:"1px solid #2a2a2a" }}><ChevRightIcon/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d=><div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day,idx)=>{
              if(!day) return <div key={`e-${idx}`}/>;
              const key      = toKey(year,month,day);
              const isToday  = key===toKey(today.getFullYear(),today.getMonth(),today.getDate());
              const isSel    = key===selected;
              const dayTasks = tasks[key]??[];
              return (
                <button key={key} onClick={()=>setSelected(key)}
                  className="relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl transition-all duration-150 hover:bg-[#1a1a1a]"
                  style={{ backgroundColor:isSel?"#6C63FF22":"transparent", border:isSel?"1px solid #6C63FF":"1px solid transparent" }}>
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday?"text-white":isSel?"text-white":"text-gray-400"}`}
                    style={{ backgroundColor:isToday?"#6C63FF":"transparent" }}>{day}</span>
                  {dayTasks.length>0&&(
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5">
                      {dayTasks.slice(0,3).map((t,i)=>(
                        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor:t.catColor }}/>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="w-full lg:w-72 flex-shrink-0 px-5 lg:px-0 pb-6 lg:pb-0" style={{ borderLeft:"1px solid #1f1f1f" }}>
          <div className="sticky top-[73px] overflow-auto" style={{ maxHeight:"calc(100vh - 73px)" }}>
            <div className="p-5">
              <p className="text-white font-bold text-base mb-0.5">{formatSelected()}</p>
              <p className="text-gray-500 text-xs mb-5">{selectedTasks.length} tasks</p>
              <div className="space-y-2 mb-4">
                {selectedTasks.length===0&&<p className="text-gray-600 text-sm text-center py-6">No tasks for this day</p>}
                {selectedTasks.map(task=>(
                  <div key={task.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                    style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a", opacity:task.done?0.5:1 }}>
                    <button onClick={()=>toggleTask(selected,task.id)}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ borderColor:task.done?"#6C63FF":"#444", backgroundColor:task.done?"#6C63FF":"transparent" }}>
                      {task.done&&<svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${task.done?"line-through text-gray-600":"text-white"}`}>{task.title}</p>
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold mt-0.5 inline-block" style={{ backgroundColor:task.catColor+"22", color:task.catColor }}>{task.category}</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor:PRIORITY_COLOR[task.priority] }}/>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowAdd(true)}
                className="w-full rounded-2xl py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-6"
                style={{ backgroundColor:"#6C63FF" }}>
                <PlusIcon/> + Add task for this day
              </button>
              <div>
                <p className="text-gray-500 text-xs font-semibold tracking-widest mb-3">CATEGORIES</p>
                <div className="space-y-2">
                  {CATEGORIES.map(cat=>(
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor:cat.color }}/>
                      <span className="text-gray-300 text-sm">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdd&&<AddTaskModal date={selected} onClose={()=>setShowAdd(false)} onAdd={addTask}/>}
    </div>
  );
}