import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { fetchUserBadges } from "../lib/badges";
import { fetchTasks, createTask, updateTask, deleteTask } from "../lib/tasks";
import { fetchCategories } from "../lib/categories";
import { supabase } from "../lib/supabase";
import { playTaskComplete, playStreakMilestone } from "../lib/sounds";
import {
  identifyUser,
  trackTaskCreated,
  trackTaskCompleted,
  trackTaskDeleted,
  trackTaskEdited,
} from "../lib/analytics";

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks,         setTasks]         = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [totalXP,       setTotalXP]       = useState(0);
  const [streak,        setStreak]        = useState({ current: 0, best: 0 });
  const [loading,       setLoading]       = useState(true);
  const [pendingBadges, setPendingBadges] = useState([]);
  const [badges,        setBadges]        = useState([]);

  // ─── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    identifyUser(user.id, {
      email:      user.email,
      name:       user.user_metadata?.full_name ?? null,
      created_at: user.created_at,
    });

    async function load() {
      try {
        const [tasksData, catsData, xpData, streakData, badgesData] = await Promise.all([
          fetchTasks(user.id),
          fetchCategories(user.id),
          supabase.from("xp_log").select("amount").eq("user_id", user.id),
          supabase.from("streaks").select("*").eq("user_id", user.id).single(),
          fetchUserBadges(user.id),
        ]);

        setTasks(tasksData);
        setCategories(catsData);
        setBadges(badgesData);

        if (xpData.data) {
          setTotalXP(xpData.data.reduce((sum, row) => sum + (row.amount ?? 0), 0));
        }
        if (streakData.data) {
          setStreak(streakData.data);
        }
      } catch (err) {
        console.error("TasksContext load error:", err);
        navigate("/500", { state: { error: err.message } });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // ─── Realtime XP ───────────────────────────────────────────────────────────
  // Kept as a sync mechanism for XP grants that don't originate from this
  // client (e.g. a cron-awarded bonus, or the same account active on another
  // device). toggleTask below now updates totalXP directly too, so if this
  // subscription is actually delivering events, completing a task could
  // double-count. See note in toggleTask.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("xp_log_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "xp_log", filter: `user_id=eq.${user.id}` },
        (payload) => setTotalXP(prev => prev + (payload.new.amount ?? 0))
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ─── dismissBadge ──────────────────────────────────────────────────────────
  const dismissBadge = useCallback(() => {
    setPendingBadges(prev => prev.slice(1));
  }, []);

  // ─── toggleTask ────────────────────────────────────────────────────────────
  const toggleTask = useCallback(async (taskOrId, onCelebration) => {
    const task    = typeof taskOrId === "object" ? taskOrId : tasks.find(t => t.id === taskOrId);
    const newDone = !task.done;

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone } : t));

    try {
      await updateTask(task.id, { done: newDone });

      if (newDone) {
        const res = await supabase.functions.invoke("complete-task", {
          body: { task_id: task.id, user_id: user.id },
        });

        console.log("complete-task response:", JSON.stringify(res));

        if (res.error) console.error("complete-task error:", res.error);

        if (res.data) {
          const { xp_awarded, new_streak, new_badges = [], duplicate } = res.data;

          // FIX 4: totalXP was only ever updated via the xp_log realtime
          // subscription. If that subscription isn't actually delivering
          // events (table not added to the realtime publication, or no
          // RLS SELECT policy on xp_log), totalXP would only refresh on
          // a full reload. Updating it directly here, the same way streak
          // already is below, guarantees the UI reflects the award
          // immediately regardless of realtime configuration.
          setTotalXP(prev => prev + (xp_awarded ?? 0));

          setStreak(prev => ({
            ...prev,
            current: new_streak,
            best: Math.max(new_streak, prev.best),
          }));

          onCelebration?.({ title: task.title, xp: xp_awarded, newStreak: new_streak });

          playTaskComplete();
          if ([7, 14, 21, 30, 60, 100].includes(new_streak)) {
            playStreakMilestone();
          }

          trackTaskCompleted({ task_id: task.id, priority: task.priority, xp_awarded, new_streak });

          if (new_badges.length > 0) {
            setBadges(prev => [
              ...prev,
              ...new_badges.map(b => ({
                badge_id: b,
                unlocked_at: new Date().toISOString(),
              })),
            ]);

            setTimeout(() => {
              setPendingBadges(prev => [...prev, ...new_badges]);
            }, 4000);
          }
        } if (duplicate) return;
      }
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: task.done } : t));
      console.error("Toggle task error:", err);
    }
  }, [tasks, user]);

  // ─── addTask ───────────────────────────────────────────────────────────────
  const addTask = useCallback(async (data) => {
    try {
      const newTask = await createTask(user.id, {
        title:       data.title,
        priority:    data.priority,
        est:         data.est,
        due_date:    data.due_date ?? data.due ?? null,
        category_id: data.category_id ?? null,
      });

      setTasks(prev => [newTask, ...prev]);

      trackTaskCreated({
        priority:     data.priority,
        has_category: !!data.category_id,
        has_due_date: !!(data.due_date ?? data.due),
        est:          data.est ?? null,
      });

      return newTask;
    } catch (err) {
      console.error("addTask error:", err);
      navigate("/500", { state: { error: err.message } });
    }
  }, [user]);

  // ─── editTask ──────────────────────────────────────────────────────────────
  const editTask = useCallback(async (taskId, data) => {
    try {
      const original = tasks.find(t => t.id === taskId);

      const updated = await updateTask(taskId, {
        title:       data.title,
        priority:    data.priority,
        due_date:    data.due_date ?? data.due ?? null,
        est:         data.est,
        category_id: data.category_id ?? null,
      });

      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));

      if (original) {
        const changed_fields = Object.keys(data).filter(k => {
          const key = k === "due" ? "due_date" : k;
          return original[key] !== data[k];
        });
        if (changed_fields.length > 0) trackTaskEdited({ task_id: taskId, changed_fields });
      }

      return updated;
    } catch (err) {
      console.error("editTask error:", err);
      navigate("/500", { state: { error: err.message } });
    }
  }, [tasks]);

  // ─── removeTask ────────────────────────────────────────────────────────────
  const removeTask = useCallback(async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      trackTaskDeleted({ task_id: taskId, priority: task?.priority ?? null });
    } catch (err) {
      console.error("removeTask error:", err);
      navigate("/500", { state: { error: err.message } });
    }
  }, [tasks]);

  return (
    <TasksContext.Provider value={{
      tasks, categories, totalXP, streak, loading,
      toggleTask, addTask, editTask, removeTask,
      setTasks, setCategories,
      badges,
      pendingBadges, dismissBadge,
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside TasksProvider");
  return ctx;
}