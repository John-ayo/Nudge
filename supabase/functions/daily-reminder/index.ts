import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPushToUser } from "../_shared/push.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DEFAULT_TZ = "Africa/Lagos";
// If a cron tick is late or missed, still send within this many minutes
// after the user's reminder time, but never hours later.
const CATCH_UP_MINUTES = 60;

function resolveTz(tz: string | null): string {
  const candidate = tz || DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: candidate });
    return candidate;
  } catch {
    return DEFAULT_TZ;
  }
}

function minutesNowInTz(tz: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

// Accepts "08:00" or "08:00:00" (Postgres time columns return the latter)
function reminderToMinutes(value: string | null): number {
  const [h, m] = (value || "08:00").split(":");
  const total = Number(h) * 60 + Number(m);
  return Number.isNaN(total) ? 8 * 60 : total;
}

function todayKey(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const s of settings) {
    const tz = resolveTz(s.timezone);
    // Minutes since the reminder time, wrapping around midnight
    const elapsed =
      (minutesNowInTz(tz) - reminderToMinutes(s.reminder_time) + 1440) % 1440;
    if (elapsed >= CATCH_UP_MINUTES) continue;

    const logType = `daily_reminder_${todayKey(tz)}`;

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

    const payload = JSON.stringify({
      title: "Good morning 👋",
      body: "Your tasks are waiting. Let's get something done today.",
      url: "/dashboard",
      tag: "nudge-daily-reminder",
    });

    const result = await sendPushToUser(supabase, s.user_id, payload, {
      ttl: 3 * 60 * 60,
      urgency: "normal",
    });

    if (result.subscriptions === 0) {
      skipped++;
    } else if (result.sent > 0) {
      await supabase
        .from("notification_log")
        .insert({ user_id: s.user_id, type: logType });
      sent++;
    } else {
      failed++;
    }
  }

  return new Response(JSON.stringify({ sent, skipped, failed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});