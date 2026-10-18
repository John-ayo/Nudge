import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPushToUser } from "../_shared/push.ts";
import { requireInternalSecret } from "../_shared/internal-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

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

function buildEmailHtml(params: {
  name: string;
  tasksCompleted: number;
  xpEarned: number;
  streak: number;
  badges: string[];
  motivationalLine: string;
}): string {
  const { name, tasksCompleted, xpEarned, streak, badges, motivationalLine } = params;
  const firstName = name?.split(" ")[0] || "there";

  const badgesHtml =
    badges.length > 0
      ? badges
          .map(
            (b) =>
              `<span style="display:inline-block;background:#1a1a2e;border:1px solid #6C63FF;color:#6C63FF;border-radius:20px;padding:4px 14px;font-size:13px;margin:4px;">${
                BADGE_LABELS[b] ?? b
              }</span>`
          )
          .join("")
      : `<p style="color:#555;font-size:14px;margin:0;">No new badges this week. They're coming.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your Weekly Nudge Pride Report</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0d0d0d;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:32px 40px 24px;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#6C63FF;">Nu</span><span style="color:#F5F5F5;">dge</span>
              </p>
              <p style="margin:8px 0 0;color:#555;font-size:13px;">Weekly Pride Report</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#F5F5F5;line-height:1.3;">
                Here's what you pulled off this week, ${firstName}.
              </h1>
              <p style="margin:12px 0 0;color:#888;font-size:15px;line-height:1.6;">
                Every number below is a choice you made to show up.
              </p>
            </td>
          </tr>

          <!-- Stats Grid -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align:center;background:#111;border-radius:12px;padding:20px 10px;border:1px solid #1f1f1f;">
                    <p style="margin:0;font-size:36px;font-weight:700;color:#6C63FF;">${tasksCompleted}</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Tasks Done</p>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="text-align:center;background:#111;border-radius:12px;padding:20px 10px;border:1px solid #1f1f1f;">
                    <p style="margin:0;font-size:36px;font-weight:700;color:#6C63FF;">${xpEarned}</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">XP Earned</p>
                  </td>
                  <td width="4%"></td>
                  <td width="26%" style="text-align:center;background:#111;border-radius:12px;padding:20px 10px;border:1px solid #1f1f1f;">
                    <p style="margin:0;font-size:36px;font-weight:700;color:#6C63FF;">${streak}</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Day Streak</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badges -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Badges Unlocked This Week</p>
              <div>${badgesHtml}</div>
            </td>
          </tr>

          <!-- Motivational Line -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#0d0d1a;border-left:3px solid #6C63FF;border-radius:0 8px 8px 0;padding:16px 20px;">
                <p style="margin:0;color:#c0bdf5;font-size:15px;line-height:1.6;font-style:italic;">"${motivationalLine}"</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://nudge.com.ng/dashboard"
                style="display:inline-block;background:#6C63FF;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;">
                Open Nudge
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#000;padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
              <p style="margin:0;color:#444;font-size:12px;">
                You're receiving this because you enabled weekly pride emails in Nudge.
              </p>
              <p style="margin:6px 0 0;color:#333;font-size:12px;">
                &copy; 2026 Nudge. Built for doers.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (rep) => {
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

      // Send email via Resend
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Nudge <pride@nudge.com.ng>",
          to: [user.email],
          subject: `Your week in Nudge: ${tasksCompleted} tasks done 🔥`,
          html,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error(`Resend failed for ${userId}:`, err);
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