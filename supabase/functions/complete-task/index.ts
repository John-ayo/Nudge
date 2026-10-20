import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const XP_MAP: Record<string, number> = {
  low: 20,
  medium: 30,
  high: 45,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Who is calling? Trust the JWT, never the request body.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);
    const userId = user.id;

    const { task_id, user_id } = await req.json();
    if (!task_id) return json({ error: "task_id is required" }, 400);
    if (user_id && user_id !== userId) return json({ error: "Forbidden" }, 403);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. The task must belong to the caller. The frontend sets done, so it is not checked here.
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, priority")
      .eq("id", task_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (taskError || !task) {
      return json({ error: "Task not found" }, 404);
    }

    const currentStreak = async () => {
      const { data } = await supabase
        .from("streaks")
        .select("current, best")
        .eq("user_id", userId)
        .maybeSingle();
      return { current: data?.current ?? 0, best: data?.best ?? 0 };
    };

    const duplicate = async () => {
      const s = await currentStreak();
      return json({ xp_awarded: 0, duplicate: true, new_streak: s.current, best_streak: s.best });
    };

    // 2. One XP award per task
    const { data: already } = await supabase
      .from("xp_log")
      .select("id")
      .eq("task_id", task_id)
      .eq("user_id", userId)
      .limit(1);
    if (already && already.length > 0) return await duplicate();

    const xp = XP_MAP[task.priority] ?? 20;

    const { error: xpError } = await supabase.from("xp_log").insert({
      user_id: userId,
      task_id,
      amount: xp,
      reason: `Completed a ${task.priority} priority task`,
      created_at: new Date().toISOString(),
    });

    if (xpError) {
      // The unique index caught a concurrent duplicate
      if (xpError.code === "23505") return await duplicate();
      throw xpError;
    }

    // 3. Streak
    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let newCurrent = 1;
    let newBest = 1;

    if (streak) {
      const now = new Date();
      let diffDays = 1;
      if (streak.last_active) {
        const lastActive = new Date(streak.last_active);
        diffDays = Math.floor(
          (new Date(now.toDateString()).getTime() - new Date(lastActive.toDateString()).getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      const current = streak.current ?? 0;
      newCurrent = diffDays >= 1 ? current + 1 : current;
      newBest = Math.max(newCurrent, streak.best ?? 0);

      const { error } = await supabase
        .from("streaks")
        .update({
          current: newCurrent,
          best: newBest,
          last_active: now.toISOString(),
          grace_used: false,
        })
        .eq("user_id", userId);
      if (error) console.error("Streak update failed:", error.message);
    } else {
      const { error } = await supabase.from("streaks").insert({
        user_id: userId,
        current: 1,
        best: 1,
        last_active: new Date().toISOString(),
        grace_used: false,
      });
      if (error) console.error("Streak insert failed:", error.message);
    }

    return json({ xp_awarded: xp, new_streak: newCurrent, best_streak: newBest });
  } catch (err) {
    console.error("complete-task failed:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});