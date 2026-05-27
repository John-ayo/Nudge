import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchTasks, createTask, updateTask, deleteTask } from "../lib/tasks";
import { fetchCategories } from "../lib/categories";
import { supabase } from "../lib/supabase";

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user } = useAuth();

  const [tasks,      setTasks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalXP,    setTotalXP]    = useState(0);
  const [streak,     setStreak]     = useState({ current: 0, best: 0 });
  const [loading,    setLoading]    = useState(true);

  // Initial load
  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const [tasksData, catsData, xpData, streakData] = await Promise.all([
          fetchTasks(user.id),
          fetchCategories(user.id),
          supabase.from("xp_log").select("amount").eq("user_id", user.id),
          supabase.from("streaks").select("*").eq("user_id", user.id).single(),
        ]);

        setTasks(tasksData);
        setCategories(catsData);

        if (xpData.data) {
          setTotalXP(xpData.data.reduce((sum, row) => sum + (row.amount ?? 0), 0));
        }
        if (streakData.data) {
          setStreak(streakData.data);
        }
      } catch (err) {
        console.error("TasksContext load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // Realtime XP updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("xp_log_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "xp_log", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setTotalXP(prev => prev + (payload.new.amount ?? 0));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const toggleTask = useCallback(async (taskOrId, onCelebration) => {
    const task   = typeof taskOrId === "object" ? taskOrId : tasks.find(t => t.id === taskOrId);
    const newDone = !task.done;

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone } : t));

    try {
      await updateTask(task.id, { done: newDone });

      if (newDone) {
        const res = await supabase.functions.invoke("complete-task", {
          body: { task_id: task.id, user_id: user.id },
        });

        if (res.error) console.error("complete-task error:", res.error);

        if (res.data) {
          const { xp_awarded, new_streak } = res.data;
          setStreak(prev => ({ ...prev, current: new_streak, best: Math.max(new_streak, prev.best) }));
          onCelebration?.({ title: task.title, xp: xp_awarded, newStreak: new_streak });
        }
      }
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: task.done } : t));
      console.error("Toggle task error:", err);
    }
  }, [tasks, user]);

  const addTask = useCallback(async (data) => {
    const newTask = await createTask(user.id, {
      title:       data.title,
      priority:    data.priority,
      est:         data.est,
      due_date:    data.due_date ?? data.due ?? null,
      category_id: data.category_id ?? null,
    });
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [user]);

  const editTask = useCallback(async (taskId, data) => {
    const updated = await updateTask(taskId, {
      title:       data.title,
      priority:    data.priority,
      due_date:    data.due_date ?? data.due ?? null,
      est:         data.est,
      category_id: data.category_id ?? null,
    });
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, []);

  const removeTask = useCallback(async (taskId) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return (
    <TasksContext.Provider value={{
      tasks, categories, totalXP, streak, loading,
      toggleTask, addTask, editTask, removeTask,
      setTasks, setCategories,
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