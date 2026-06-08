import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, CheckSquare, Tag,
  Calendar, Settings, User, X, Flame, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAccent } from "../context/AccentContext";
import { getTotalXP } from "../lib/xp";
import { getStreak } from "../lib/streaks";
import { supabase } from "../lib/supabase";

const NAV = [
  { label: "Dashboard",  Icon: LayoutDashboard, path: "/dashboard"  },
  { label: "My Tasks",   Icon: CheckSquare,     path: "/tasks"      },
  { label: "Categories", Icon: Tag,             path: "/categories" },
  { label: "Calendar",   Icon: Calendar,        path: "/calendar"   },
  { label: "Settings",   Icon: Settings,        path: "/settings"   },
  { label: "Account",    Icon: User,            path: "/account"    },
];

function getLevel(totalXP) {
  return Math.floor(totalXP / 500) + 1;
}

function getLevelXP(totalXP) {
  const xpIntoLevel = totalXP % 500;
  return { current: xpIntoLevel, max: 500 };
}

export default function Sidebar({ open, onClose }) {
  const { user }    = useAuth();
  const { accent }  = useAccent();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [totalXP, setTotalXP] = useState(0);
  const [todayXP, setTodayXP] = useState(0);
  const [streak,  setStreak]  = useState(0);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const [total, streakData] = await Promise.all([
          getTotalXP(user.id),
          getStreak(user.id),
        ]);
        setTotalXP(total);
        setStreak(streakData?.current ?? 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from("xp_log")
          .select("amount")
          .eq("user_id", user.id)
          .gte("created_at", todayStart.toISOString());

        if (data) {
          setTodayXP(data.reduce((sum, row) => sum + (row.amount ?? 0), 0));
        }
      } catch (err) {
        console.error("Sidebar load error:", err);
      }
    }

    load();
  }, [user]);

  // Realtime XP
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("sidebar_xp_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "xp_log", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const amount = payload.new.amount ?? 0;
          setTotalXP(prev => prev + amount);
          setTodayXP(prev => prev + amount);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Realtime streak
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("sidebar_streak_realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "streaks", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setStreak(payload.new.current ?? 0);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const level                           = getLevel(totalXP);
  const { current: levelXP, max: levelMax } = getLevelXP(totalXP);
  const xpPct                           = Math.min((levelXP / levelMax) * 100, 100);
  const name                            = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const handleNav                       = path => { navigate(path); onClose?.(); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose}/>
      )}

      <div
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ width: 260, backgroundColor: "#0d0d0d", borderRight: "1px solid #1f1f1f" }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={() => handleNav("/dashboard")}>
            <span className="text-xl font-bold" style={{ fontFamily: "'Syne',sans-serif" }}>
              <span className="text-white">Nudge</span>
              <span style={{ color: accent }}>.</span>
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
              <button key={label} onClick={() => handleNav(path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? accent : "transparent",
                  color: isActive ? "#fff" : "#9CA3AF",
                }}>
                <Icon size={16}/>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User panel */}
        <div className="p-4 border-t" style={{ borderColor: "#1f1f1f" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: accent }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{name}</p>
              <p className="text-gray-500 text-xs">Level {level}</p>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">XP Progress</span>
            <span className="text-gray-400">{levelXP} / {levelMax}</span>
          </div>
          <div className="h-1.5 rounded-full mb-3" style={{ backgroundColor: "#1f1f1f" }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${xpPct}%`, backgroundColor: accent }}/>
          </div>

          {/* Streak + XP today */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#161616" }}>
              <div className="flex justify-center mb-1"><Flame size={18} color="#F97316"/></div>
              <div className="text-white text-sm font-bold">{streak}</div>
              <div className="text-gray-500 text-xs">streak</div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#161616" }}>
              <div className="flex justify-center mb-1"><Zap size={18} color={accent}/></div>
              <div className="font-bold text-sm" style={{ color: accent }}>{todayXP}</div>
              <div className="text-gray-500 text-xs">XP today</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}