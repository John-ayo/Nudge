import { useState } from "react";

import { Menu, Zap, Flame, BarChart2, Timer } from "lucide-react";

const PRIDE_DATA = Array.from({length:30},(_,i)=>({ day:i+1, tasks:Math.floor(Math.random()*10) }));
const maxTasks   = Math.max(...PRIDE_DATA.map(d=>d.tasks),1);

const STATS = [
  { value:"4,820",   label:"Total XP",       color:"#6C63FF", Icon:Zap      },
  { value:"14 days", label:"Best streak",    color:"#F59E0B", Icon:Flame    },
  { value:"8 tasks", label:"Avg / Day",      color:"#22C55E", Icon:BarChart2 },
  { value:"38",      label:"Focus sessions", color:"#06B6D4", Icon:Timer    },
];

export default function ProfilePage({ onMenuOpen, user }) {

  const [badgeFilter, setBadgeFilter] = useState("All");

  const name = user?.name ?? "Johnpaul3.0";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor:"#0a0a0a", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}`}</style>



      <div className="sticky top-0 z-20 flex items-center gap-4 px-5 lg:px-8 py-5"
        style={{ backgroundColor:"#0a0a0a", borderBottom:"1px solid #141414" }}>
        <button onClick={()=>{ onMenuOpen?.(); }} className="lg:hidden text-gray-400 hover:text-white transition-colors">
          <Menu size={22}/>
        </button>
        <div>
          <p className="text-gray-500 text-xs tracking-widest font-medium">PROFILE</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily:"'Syne',sans-serif" }}>Account</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 lg:px-8 py-6">

        {/* Hero card */}
        <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor:"#6C63FF" }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily:"'Syne',sans-serif" }}>{name}</h2>
                <span className="rounded-full px-3 py-0.5 text-xs font-bold text-white" style={{ backgroundColor:"#6C63FF" }}>Level 4</span>
                <span className="rounded-full px-3 py-0.5 text-xs font-bold flex items-center gap-1" style={{ backgroundColor:"#052e16", color:"#4ade80" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>Active
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">Member since January 2026 · Builder &amp; Doer</p>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400">XP Progress to level 5</span>
                <span className="text-gray-400">4820 / 6000</span>
              </div>
              <div className="h-1.5 rounded-full w-full max-w-xs" style={{ backgroundColor:"#2a2a2a" }}>
                <div className="h-1.5 rounded-full" style={{ width:"80%", backgroundColor:"#6C63FF" }}/>
              </div>
            </div>
            <div className="flex gap-6 flex-shrink-0">
              {[
                { value:"247", label:"Task Done"  },
                { value:"7",   label:"Day Streak", Icon:Flame, iconColor:"#F97316" },
                { value:"0",   label:"Badges"     },
              ].map(s=>(
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                    {s.value}{s.Icon && <s.Icon size={18} color={s.iconColor}/>}
                  </p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {STATS.map(s=>(
            <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
              <div className="mb-3" style={{ color:s.color }}><s.Icon size={20}/></div>
              <p className="text-2xl font-bold mb-0.5" style={{ color:s.color }}>{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pride Chart */}
        <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
          <h3 className="text-white font-bold text-base mb-0.5" style={{ fontFamily:"'Syne',sans-serif" }}>Pride Chart</h3>
          <p className="text-gray-500 text-xs mb-5">Tasks completed · Last 30 days</p>
          <div className="flex items-end gap-1 h-24 mb-3">
            {PRIDE_DATA.map(d=>(
              <div key={d.day} className="flex-1 flex items-end">
                <div className="w-full rounded-t-sm transition-all hover:opacity-80"
                  style={{ height:`${Math.max((d.tasks/maxTasks)*100,4)}%`, backgroundColor:d.tasks>6?"#6C63FF":d.tasks>3?"#6C63FF88":"#2a2a2a", minHeight:"4px" }}
                  title={`Day ${d.day}: ${d.tasks} tasks`}/>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Apr 1</span><span>Apr 30</span>
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl p-6" style={{ backgroundColor:"#161616", border:"1px solid #2a2a2a" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-base" style={{ fontFamily:"'Syne',sans-serif" }}>Achievements</h3>
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor:"#111" }}>
              {["All","Unlocked","Locked"].map(f=>(
                <button key={f} onClick={()=>setBadgeFilter(f)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{ backgroundColor:badgeFilter===f?"#2a2a2a":"transparent", color:badgeFilter===f?"#fff":"#9CA3AF", border:badgeFilter===f?"1px solid #444":"1px solid transparent" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <p className="text-gray-500 text-xs mb-5">6 of 12 unlocked</p>
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-2xl font-bold" style={{ color:"#6C63FF", fontFamily:"'Syne',sans-serif" }}>Coming soon</p>
            <p className="text-gray-600 text-sm mt-1">Badges are being built. Check back soon.</p>
          </div>
        </div>

      </div>
    </div>
  );
}