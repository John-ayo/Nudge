import { useState, useEffect, useCallback } from "react";
import { Star, Moon, Zap, Flame, Trophy, Rocket } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { pickAffirmation, AFFIRMATIONS } from "../lib/affirmations";

const CATEGORY_META = {
  morning:          { Icon: Star,    color: "#F59E0B" },
  afternoon:        { Icon: Zap,     color: "#6C63FF" },
  evening:          { Icon: Moon,    color: "#818CF8" },
  streak_building:  { Icon: Flame,   color: "#F97316" },
  streak_milestone: { Icon: Trophy,  color: "#F59E0B" },
  crushing_it:      { Icon: Rocket,  color: "#6C63FF" },
  no_tasks:         { Icon: Star,    color: "#6C63FF" },
  monday:           { Icon: Zap,     color: "#6C63FF" },
  friday:           { Icon: Star,    color: "#22C55E" },
  default:          { Icon: Star,    color: "#6C63FF" },
};

function buildContext(tasks, streak) {
  const now      = new Date();
  const todayStr = now.toLocaleDateString("en-CA");
  const todayTasks = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) === todayStr);

  return {
    hour:            now.getHours(),
    dayOfWeek:       now.getDay(),
    streakCount:     streak?.current ?? 0,
    tasksDoneToday:  todayTasks.filter(t => t.done).length,
    tasksTotalToday: todayTasks.length,
  };
}

export function useAffirmation() {
  const { tasks, streak, loading } = useTasks();
  const [current, setCurrent] = useState(null);

  // Pick once when data is ready
  useEffect(() => {
    if (loading || current) return;
    const ctx = buildContext(tasks, streak);
    setCurrent(pickAffirmation(ctx));
  }, [loading, tasks, streak, current]);

  // Refresh picks a different message from the same pool, excluding the current one
  const refresh = useCallback(() => {
    const ctx = buildContext(tasks, streak);
    setCurrent(prev => pickAffirmation(ctx, prev?.message));
  }, [tasks, streak]);

  const active = current ?? { message: AFFIRMATIONS.default[0], category: "default" };
  const meta   = CATEGORY_META[active.category] ?? CATEGORY_META.default;

  return {
    message:  active.message,
    category: active.category,
    Icon:     meta.Icon,
    color:    meta.color,
    refresh,
  };
}