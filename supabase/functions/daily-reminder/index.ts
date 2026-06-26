import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:johnpaulthedev@gmail.com";

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function getCurrentTimeInTz(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${hour}:${minute}`;
  } catch {
    return "00:00";
  }
}

function getTodayKey(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get all users with daily reminder enabled
  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("user_id, reminder_time, timezone")
    .eq("notification_daily_reminder", true);

  if (settingsError) {
    console.error("Failed to fetch settings:", settingsError);
    return new Response(JSON.stringify({ error: "Failed to fetch settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!settings || settings.length === 0) {
    return new Response(JSON.stringify({ skipped: "no users" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Filter users where current time in their timezone matches their reminder_time
  const qualifying = settings.filter((s) => {
    const tz = s.timezone || "Africa/Lagos";
    const reminderTime = s.reminder_time || "08:00";
    const currentTime = getCurrentTimeInTz(tz);
    return currentTime === reminderTime;
  });

  if (qualifying.length === 0) {
    return new Response(JSON.stringify({ skipped: "no users at reminder time" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const s of qualifying) {
    const tz = s.timezone || "Africa/Lagos";
    const todayKey = getTodayKey(tz);
    const logType = `daily_reminder_${todayKey}`;

    // Check if we already sent this user a daily reminder today
    const { data: existing } = await supabase
      .from("notification_log")
      .select("id")
      .eq("user_id", s.user_id)
      .eq("type", logType)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", s.user_id);

    if (!subscriptions || subscriptions.length === 0) {
      skipped++;
      continue;
    }

    const payload = JSON.stringify({
      title: "Good morning 👋",
      body: "Your tasks are waiting. Let's get something done today.",
      url: "/dashboard",
      tag: "nudge-daily-reminder",
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    );

    const anySucceeded = results.some((r) => r.status === "fulfilled");

    if (anySucceeded) {
      // Log so we don't send again today
      await supabase.from("notification_log").insert({
        user_id: s.user_id,
        type: logType,
      });
      sent++;
    } else {
      failed++;
    }

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
  }

  return new Response(JSON.stringify({ sent, skipped, failed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});