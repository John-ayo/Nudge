import { createClient } from "npm:@supabase/supabase-js@2";
import { requireInternalSecret } from "../_shared/internal-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DAY_MS = 24 * 60 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Midnight UTC of the day a timestamp falls on
function utcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

Deno.serve(async (req) => {
  const denied = requireInternalSecret(req);
  if (denied) return denied;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: streaks, error: streakError } = await supabase
      .from("streaks")
      .select("user_id, current, last_active, grace_used");
    if (streakError) throw streakError;

    const { data: allSettings, error: settingsError } = await supabase
      .from("settings")
      .select("user_id, streak_protection");
    if (settingsError) throw settingsError;

    const protection = new Map(
      (allSettings ?? []).map((s) => [s.user_id, s.streak_protection === true])
    );

    const today = utcDay(new Date());
    const counts = { reset: 0, graceApplied: 0, skipped: 0, failed: 0 };

    for (const s of streaks ?? []) {
      // Nothing to reset, or no activity date to judge by
      if (!s.last_active || !s.current) {
        counts.skipped++;
        continue;
      }

      const diffDays = Math.floor((today - utcDay(new Date(s.last_active))) / DAY_MS);

      // Active today or yesterday
      if (diffDays <= 1) {
        counts.skipped++;
        continue;
      }

      // Grace day: protection on, not yet used, missed exactly one day
      if (diffDays === 2 && protection.get(s.user_id) && !s.grace_used) {
        const { error } = await supabase
          .from("streaks")
          .update({ grace_used: true })
          .eq("user_id", s.user_id);
        if (error) {
          console.error("Grace update failed:", s.user_id, error.message);
          counts.failed++;
        } else {
          counts.graceApplied++;
        }
        continue;
      }

      const { error } = await supabase
        .from("streaks")
        .update({ current: 0, grace_used: false })
        .eq("user_id", s.user_id);
      if (error) {
        console.error("Reset failed:", s.user_id, error.message);
        counts.failed++;
      } else {
        counts.reset++;
      }
    }

    return json({ processed: (streaks ?? []).length, ...counts });
  } catch (err) {
    console.error("streak-cron failed:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});