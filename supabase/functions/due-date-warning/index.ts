import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPushToUser } from "../_shared/push.ts";
import { requireInternalSecret } from "../_shared/internal-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ttl is how long the push service holds the message if the device is offline.
// A "20 minutes left" alert that arrives an hour late is noise, so keep it short.
const WINDOWS = [
  { type: "due_24h", label: "24 hours", minMinutes: 23 * 60 + 30, maxMinutes: 24 * 60 + 30, ttl: 3 * 60 * 60 },
  { type: "due_1h", label: "1 hour", minMinutes: 50, maxMinutes: 70, ttl: 30 * 60 },
  { type: "due_20m", label: "20 minutes", minMinutes: 15, maxMinutes: 25, ttl: 10 * 60 },
];

const LOOKAHEAD_MS = 25 * 60 * 60 * 1000; // a bit past the largest window

Deno.serve(async (req) => {
  const denied = requireInternalSecret(req);
  if (denied) return denied;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const now = new Date();

  // Only fetch tasks that could fall inside a window, not every task ever created
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, user_id, title, due_date")
    .eq("done", false)
    .gte("due_date", now.toISOString())
    .lte("due_date", new Date(now.getTime() + LOOKAHEAD_MS).toISOString());

  if (tasksError) {
    console.error("Failed to fetch tasks:", tasksError);
    return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!tasks || tasks.length === 0) {
    return new Response(JSON.stringify({ skipped: "no tasks in range" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("user_id")
    .eq("notification_due_date_warning", true);

  const enabledUserIds = new Set((settings ?? []).map((s) => s.user_id));

  let totalSent = 0;
  let totalSkipped = 0;

  for (const task of tasks) {
    if (!enabledUserIds.has(task.user_id)) {
      totalSkipped++;
      continue;
    }

    const minutesUntilDue =
      (new Date(task.due_date).getTime() - now.getTime()) / 60000;

    for (const window of WINDOWS) {
      if (minutesUntilDue < window.minMinutes || minutesUntilDue > window.maxMinutes) {
        continue;
      }

      const { data: existing } = await supabase
        .from("notification_log")
        .select("id")
        .eq("task_id", task.id)
        .eq("type", window.type)
        .maybeSingle();

      if (existing) {
        totalSkipped++;
        continue;
      }

      const payload = JSON.stringify({
        title: `Task due in ${window.label}`,
        body: task.title,
        url: "/tasks",
        tag: `nudge-due-${window.type}-${task.id}`,
      });

      const { sent } = await sendPushToUser(supabase, task.user_id, payload, {
        ttl: window.ttl,
        urgency: "high",
      });

      if (sent > 0) {
        await supabase.from("notification_log").insert({
          user_id: task.user_id,
          task_id: task.id,
          type: window.type,
        });
        totalSent++;
      }
    }
  }

  return new Response(JSON.stringify({ sent: totalSent, skipped: totalSkipped }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});