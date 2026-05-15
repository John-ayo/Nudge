import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Tag,
  Calendar,
  Settings,
  User,
  X,
  Flame,
  Zap,
} from "lucide-react";

const NAV = [
  { label:"Dashboard",  Icon:LayoutDashboard, path:"/dashboard"  },
  { label:"My Tasks",   Icon:CheckSquare,      path:"/tasks"      },
  { label:"Categories", Icon:Tag,              path:"/categories" },
  { label:"Calendar",   Icon:Calendar,         path:"/calendar"   },
  { label:"Settings",   Icon:Settings,         path:"/settings"   },
  { label:"Account",    Icon:User,             path:"/account"    },
];

export default function Sidebar({ open, onClose, user }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const {
    name    = "Johnpaul3.0",
    level   = 4,
    xp      = 200,
    xpMax   = 800,
    streak  = 8,
    xpToday = 200,
  } = user ?? {};

  const xpPct = Math.min((xp / xpMax) * 100, 100);

  const handleNav = path => { navigate(path); onClose?.(); };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose}/>}

      <div
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ width:260, backgroundColor:"#0d0d0d", borderRight:"1px solid #1f1f1f" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={()=>handleNav("/dashboard")}>
            <span className="text-xl font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>
              <span className="text-white">Nudge</span>
              <span style={{ color:"#6C63FF" }}>.</span>
            </span>
          </button>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X size={18}/>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 pt-2">
          {NAV.map(({ label, Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <button key={label} onClick={()=>handleNav(path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ backgroundColor:isActive?"#6C63FF":"transparent", color:isActive?"#fff":"#9CA3AF" }}>
                <Icon size={16}/>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User panel */}
        <div className="p-4 border-t" style={{ borderColor:"#1f1f1f" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor:"#6C63FF" }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{name}</p>
              <p className="text-gray-500 text-xs">Level {level}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">XP Progress</span>
            <span className="text-gray-400">{xp} / {xpMax}</span>
          </div>
          <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor:"#1f1f1f" }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width:`${xpPct}%`, backgroundColor:"#6C63FF" }}/>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor:"#161616" }}>
              <div className="flex justify-center mb-1"><Flame size={18} color="#F97316"/></div>
              <div className="text-white text-sm font-bold">{streak}</div>
              <div className="text-gray-500 text-xs">streak</div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor:"#161616" }}>
              <div className="flex justify-center mb-1"><Zap size={18} color="#6C63FF"/></div>
              <div className="font-bold text-sm" style={{ color:"#6C63FF" }}>{xpToday}</div>
              <div className="text-gray-500 text-xs">XP today</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}