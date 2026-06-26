import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:johnpaulthedev@gmail.com";

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const WINDOWS = [
  {
    type: "due_24h",
    label: "24 hours",
    minMinutes: 23 * 60 + 30, // 23.5 hours
    maxMinutes: 24 * 60 + 30, // 24.5 hours
  },
  {
    type: "due_1h",
    label: "1 hour",
    minMinutes: 50,
    maxMinutes: 70,
  },
  {
    type: "due_20m",
    label: "20 minutes",
    minMinutes: 15,
    maxMinutes: 25,
  },
];

async function sendPush(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  payload: string
) {
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return { sent: 0 };

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
    )
  );

  // Clean up expired subscriptions
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const reason = result.reason?.toString() ?? "";
      if (reason.includes("410") || reason.includes("404")) {
        supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscriptions[i].endpoint)
          .then(() => console.log("Cleaned expired subscription"));
      }
    }
  });

  return {
    sent: results.filter((r) => r.status === "fulfilled").length,
  };
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const now = new Date();

  // Fetch all incomplete tasks with a due date
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, user_id, title, due_date")
    .eq("done", false)
    .not("due_date", "is", null);

  if (tasksError) {
    console.error("Failed to fetch tasks:", tasksError);
    return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!tasks || tasks.length === 0) {
    return new Response(JSON.stringify({ skipped: "no tasks with due dates" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get users who have due date warnings enabled
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

    const dueDate = new Date(task.due_date);
    const minutesUntilDue = (dueDate.getTime() - now.getTime()) / 60000;

    for (const window of WINDOWS) {
      if (
        minutesUntilDue < window.minMinutes ||
        minutesUntilDue > window.maxMinutes
      ) {
        continue;
      }

      // Check if this notification was already sent for this task
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

      const { sent } = await sendPush(supabase, task.user_id, payload);

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

  return new Response(
    JSON.stringify({ sent: totalSent, skipped: totalSkipped }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});