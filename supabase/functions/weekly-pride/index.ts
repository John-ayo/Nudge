import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPushToUser } from "../_shared/push.ts";
import { requireInternalSecret } from "../_shared/internal-auth.ts";
import { BRAND, escapeHtml, renderEmail, sendEmail } from "../_shared/email.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BADGE_LABELS: Record<string, string> = {
  first_blood: "First Blood",
  on_a_roll: "On a Roll",
  unstoppable: "Unstoppable",
  century: "Century",
  xp_hunter: "XP Hunter",
  speed_demon: "Speed Demon",
  centurion: "Centurion",
};

const MOTIVATIONAL_LINES = [
  "Every task you finish is proof you mean business. Keep going.",
  "Progress isn't loud. But it's real. You're doing it.",
  "Another week, another win. Don't stop now.",
  "You showed up this week. That's more than most people do.",
  "Small steps compound. You're building something real.",
  "Consistency beats motivation every single time. You proved that this week.",
  "The version of you from last month would be proud of this week.",
];

function getMotivationalLine(tasksCompleted: number, streak: number): string {
  const index = (tasksCompleted + streak) % MOTIVATIONAL_LINES.length;
  return MOTIVATIONAL_LINES[index];
}

function buildEmailHtml(p: {
  name: string;
  tasksCompleted: number;
  xpEarned: number;
  streak: number;
  badges: string[];
  motivationalLine: string;
}): string {
  const firstName = p.name?.split(" ")[0] || "there";

  const badgesHtml =
    p.badges.length > 0
      ? p.badges
          .map(
            (b) =>
              `<span style="display:inline-block;background:#1a1a2e;border:1px solid ${BRAND.accent};color:${BRAND.accent};border-radius:20px;padding:4px 14px;font-size:13px;margin:4px;">${escapeHtml(BADGE_LABELS[b] ?? b)}</span>`
          )
          .join("")
      : `<p style="color:#555;font-size:14px;margin:0;">No new badges this week. They're coming.</p>`;

  const stat = (value: number, label: string, width: string) =>
    `<td width="${width}" style="text-align:center;background:#111;border-radius:12px;padding:20px 10px;border:1px solid #1f1f1f;">
      <p style="margin:0;font-size:36px;font-weight:700;color:${BRAND.accent};">${value}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
    </td>`;

  const bodyHtml = `
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${stat(p.tasksCompleted, "Tasks Done", "33%")}<td width="4%"></td>
      ${stat(p.xpEarned, "XP Earned", "33%")}<td width="4%"></td>
      ${stat(p.streak, "Day Streak", "26%")}
    </tr></table>
    <p style="margin:28px 0 12px;font-size:13px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Badges Unlocked This Week</p>
    <div>${badgesHtml}</div>`;

  return renderEmail({
    title: "Your Weekly Nudge Pride Report",
    preheader: `${p.tasksCompleted} tasks done and ${p.xpEarned} XP earned this week.`,
    heading: `Here's what you pulled off this week, ${firstName}.`,
    intro: "Every number below is a choice you made to show up.",
    bodyHtml,
    quote: p.motivationalLine,
    cta: { label: "Open Nudge", href: `${BRAND.appUrl}/dashboard` },
    footerNote: "You're receiving this because you enabled weekly pride emails in Nudge.",
  });
}

Deno.serve(async (req) => {
  const denied = requireInternalSecret(req);
  if (denied) return denied;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all users with weekly pride enabled
  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("user_id")
    .eq("notification_weekly_pride", true);

  if (settingsError || !settings || settings.length === 0) {
    return new Response(JSON.stringify({ skipped: "no users" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let emailsSent = 0;
  let failed = 0;

  for (const s of settings) {
    try {
      const userId = s.user_id;

      // Fetch all data in parallel
      const [userRes, tasksRes, xpRes, badgesRes, streakRes] = await Promise.all([
        supabase
          .from("users")
          .select("email, name")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("tasks")
          .select("id")
          .eq("user_id", userId)
          .eq("done", true)
          .gte("updated_at", oneWeekAgo),
        supabase
          .from("xp_log")
          .select("amount")
          .eq("user_id", userId)
          .gte("created_at", oneWeekAgo),
        supabase
          .from("badges")
          .select("badge_id")
          .eq("user_id", userId)
          .gte("unlocked_at", oneWeekAgo),
        supabase
          .from("streaks")
          .select("current")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      const user = userRes.data;
      if (!user?.email) continue;

      const tasksCompleted = tasksRes.data?.length ?? 0;
      const xpEarned = xpRes.data?.reduce((sum, row) => sum + (row.amount ?? 0), 0) ?? 0;
      const badges = badgesRes.data?.map((b) => b.badge_id) ?? [];
      const streak = streakRes.data?.current ?? 0;
      const motivationalLine = getMotivationalLine(tasksCompleted, streak);

      const html = buildEmailHtml({
        name: user.name ?? "",
        tasksCompleted,
        xpEarned,
        streak,
        badges,
        motivationalLine,
      });

      const subject =
        tasksCompleted > 0
          ? `Your week in Nudge: ${tasksCompleted} tasks done 🔥`
          : "Your week in Nudge: a fresh start is one task away";

      const sent = await sendEmail({
        from: "Nudge <pride@nudge.com.ng>",
        to: user.email,
        subject,
        html,
      });

      if (!sent.ok) {
        console.error(`Resend failed for ${userId}:`, sent.error);
        failed++;
        continue;
      }

      // Send push notification too
      await sendPushToUser(
        supabase,
        userId,
        JSON.stringify({
          title: "Your Weekly Pride Report is here",
          body: `${tasksCompleted} tasks done, ${xpEarned} XP earned. Check your email.`,
          url: "/dashboard",
          tag: "nudge-weekly-pride",
        })
      );

      emailsSent++;
    } catch (err) {
      console.error("Error processing user:", err);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ emailsSent, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});