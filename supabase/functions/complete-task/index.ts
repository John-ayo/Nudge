import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const XP_MAP: Record<string, number> = {
  low:    20,
  medium: 30,
  high:   45,
};

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { task_id, user_id } = await req.json();
    console.log("Received:", { task_id, user_id });
    console.log("SUPABASE_URL:", Deno.env.get("SUPABASE_URL"));

    if (!task_id || !user_id) {
      return new Response(JSON.stringify({ error: "task_id and user_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch task priority - don't check done, frontend handles that
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, priority")
      .eq("id", task_id)
      .single();

      console.log("Task query result:", { task, taskError });

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: "Task not found", detail: taskError?.message }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const xp = XP_MAP[task.priority] ?? 20;

    // 2. Insert XP log
    const { error: xpError } = await supabase
      .from("xp_log")
      .insert({
        user_id,
        task_id,
        amount:     xp,
        reason:     `Completed a ${task.priority} priority task`,
        created_at: new Date().toISOString(),
      });

    if (xpError) throw xpError;

    // 3. Upsert streak
    const { data: streak, error: streakError } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user_id)
      .single();

    let newCurrent = 1;
    let newBest    = 1;

    if (streak && !streakError) {
      const now        = new Date();
      const lastActive = new Date(streak.last_active);
      const diffDays   = Math.floor(
        (new Date(now.toDateString()).getTime() - new Date(lastActive.toDateString()).getTime())
        / (1000 * 60 * 60 * 24)
      );

      newCurrent = diffDays >= 1 ? streak.current + 1 : streak.current;
      newBest    = Math.max(newCurrent, streak.best);

      await supabase
        .from("streaks")
        .update({
          current:     newCurrent,
          best:        newBest,
          last_active: new Date().toISOString(),
          grace_used:  false,
        })
        .eq("user_id", user_id);
    } else {
      // No streak row yet - insert one
      await supabase
        .from("streaks")
        .insert({
          user_id,
          current:     1,
          best:        1,
          last_active: new Date().toISOString(),
          grace_used:  false,
        });
    }

    return new Response(
      JSON.stringify({ xp_awarded: xp, new_streak: newCurrent, best_streak: newBest }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});