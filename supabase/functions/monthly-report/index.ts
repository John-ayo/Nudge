import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPushToUser } from "../_shared/push.ts";
import { requireInternalSecret } from "../_shared/internal-auth.ts";
import { BRAND, escapeHtml, renderEmail, sendEmail } from "../_shared/email.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GH_API_TOKEN = Deno.env.get("GH_API_TOKEN");

const DEFAULT_TZ = "Africa/Lagos";
const SEND_HOUR = 9; // local hour on the 1st when reports go out
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BADGE_LABELS: Record<string, string> = {
  first_blood: "First Blood",
  on_a_roll: "On a Roll",
  unstoppable: "Unstoppable",
  century: "Century",
  xp_hunter: "XP Hunter",
  speed_demon: "Speed Demon",
  centurion: "Centurion",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function resolveTz(tz: string | null): string {
  const candidate = tz || DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: candidate });
    return candidate;
  } catch {
    return DEFAULT_TZ;
  }
}

function zonedParts(tz: string, at: Date) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const n = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return {
    year: n("year"),
    month: n("month"),
    day: n("day"),
    hour: n("hour") % 24,
    minute: n("minute"),
    second: n("second"),
  };
}

function tzOffsetMs(tz: string, at: Date): number {
  const z = zonedParts(tz, at);
  const asUtc = Date.UTC(z.year, z.month - 1, z.day, z.hour, z.minute, z.second);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

// The UTC instant of local midnight on y-m-d in the given timezone
function startOfLocalDayUtc(y: number, m: number, d: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d);
  const first = guess - tzOffsetMs(tz, new Date(guess));
  return new Date(guess - tzOffsetMs(tz, new Date(first)));
}

function dayKey(tz: string, iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
}

function longestRun(keys: string[]): number {
  const days = [...new Set(keys)].sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const k of days) {
    const t = Date.parse(`${k}T00:00:00Z`);
    run = prev !== null && t - prev === 86_400_000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

function previousMonth(year: number, month: number) {
  return month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
}

// Display only. Never used for XP. Returns null on any failure.
async function fetchCommitCount(login: string, fromIso: string, toIso: string): Promise<number | null> {
  if (!GH_API_TOKEN) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${GH_API_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "nudge-monthly-report",
      },
      body: JSON.stringify({
        query: `query($login:String!,$from:DateTime!,$to:DateTime!){
          user(login:$login){ contributionsCollection(from:$from,to:$to){ totalCommitContributions } }
        }`,
        variables: { login, from: fromIso, to: toIso },
      }),
    });
    if (!res.ok) {
      console.error("GitHub GraphQL status", res.status);
      return null;
    }
    const body = await res.json();
    const n = body?.data?.user?.contributionsCollection?.totalCommitContributions;
    return typeof n === "number" ? n : null;
  } catch (err) {
    console.error("GitHub GraphQL failed:", err);
    return null;
  }
}

// deno-lint-ignore no-explicit-any
async function computeStats(supabase: any, userId: string, tz: string, y: number, m: number) {
  const start = startOfLocalDayUtc(y, m, 1, tz);
  const end = startOfLocalDayUtc(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 1, tz);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const [xpRes, badgeRes, prRes, linkRes] = await Promise.all([
    supabase
      .from("xp_log")
      .select("amount, task_id, created_at")
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .lt("created_at", endIso)
      .limit(5000),
    supabase
      .from("badges")
      .select("badge_id")
      .eq("user_id", userId)
      .gte("unlocked_at", startIso)
      .lt("unlocked_at", endIso),
    supabase
      .from("github_prs")
      .select("repo")
      .eq("user_id", userId)
      .gte("merged_at", startIso)
      .lt("merged_at", endIso),
    supabase.from("github_links").select("username").eq("user_id", userId).maybeSingle(),
  ]);

  // Never snapshot wrong zeros: fail the run for this user instead
  if (xpRes.error) throw xpRes.error;
  if (badgeRes.error) throw badgeRes.error;
  if (prRes.error) throw prRes.error;

  // deno-lint-ignore no-explicit-any
  const xpRows: any[] = xpRes.data ?? [];
  if (xpRows.length >= 5000) console.warn("xp_log rows hit the cap for", userId);

  const taskRows = xpRows.filter((r) => r.task_id && r.created_at);
  const dayKeys = taskRows.map((r) => dayKey(tz, r.created_at));

  const username = linkRes.data?.username;
  const commits = username
    ? await fetchCommitCount(username, startIso, new Date(end.getTime() - 1000).toISOString())
    : null;

  return {
    month: `${y}-${String(m).padStart(2, "0")}`,
    label: `${MONTHS[m - 1]} ${y}`,
    timezone: tz,
    daysInMonth: new Date(Date.UTC(y, m, 0)).getUTCDate(),
    tasksDone: new Set(taskRows.map((r) => r.task_id)).size,
    xpEarned: Math.max(0, xpRows.reduce((s, r) => s + (r.amount ?? 0), 0)),
    activeDays: new Set(dayKeys).size,
    longestRun: longestRun(dayKeys),
    // deno-lint-ignore no-explicit-any
    badges: (badgeRes.data ?? []).map((b: any) => b.badge_id as string),
    prsMerged: prRes.data?.length ?? 0,
    // deno-lint-ignore no-explicit-any
    prRepos: [...new Set((prRes.data ?? []).map((r: any) => r.repo as string))].slice(0, 5),
    commits,
  };
}

// deno-lint-ignore no-explicit-any
const hasActivity = (s: any) => s.tasksDone > 0 || s.prsMerged > 0;

// deno-lint-ignore no-explicit-any
function buildEmail(name: string, s: any): string {
  const firstName = name?.split(" ")[0] || "there";

  const tile = (value: number, label: string) =>
    `<td width="24%" style="text-align:center;background:#111;border-radius:12px;padding:18px 6px;border:1px solid #1f1f1f;">
      <p style="margin:0;font-size:30px;font-weight:700;color:${BRAND.accent};">${value}</p>
      <p style="margin:6px 0 0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
    </td>`;
  const gap = `<td width="1.3%"></td>`;

  const line = (text: string) =>
    `<p style="margin:0 0 10px;color:#aaa;font-size:14px;line-height:1.6;">${text}</p>`;

  const extras: string[] = [];
  if (s.badges.length > 0) {
    extras.push(
      line(`Badges unlocked: ${s.badges.map((b: string) => escapeHtml(BADGE_LABELS[b] ?? b)).join(", ")}`)
    );
  }
  if (s.prsMerged > 0) extras.push(line(`Pull requests merged: ${s.prsMerged}`));
  if (typeof s.commits === "number" && s.commits > 0) extras.push(line(`Public commits: ${s.commits}`));

  const bodyHtml = `
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${tile(s.tasksDone, "Tasks done")}${gap}${tile(s.xpEarned, "XP")}${gap}${tile(s.activeDays, "Active days")}${gap}${tile(s.longestRun, "Best run")}
    </tr></table>
    <div style="margin-top:24px;">${extras.join("")}</div>`;

  return renderEmail({
    title: `Your ${s.label} in Nudge`,
    preheader: `${s.tasksDone} tasks done across ${s.activeDays} active days.`,
    emoji: "📅",
    heading: `${s.label}, in numbers.`,
    intro: `${firstName}, here is what you pulled off last month. Best run means your longest streak of active days.`,
    bodyHtml,
    cta: { label: "See your full report", href: `${BRAND.appUrl}/reports/${s.month}` },
    footerNote: "You're receiving this because monthly reports are enabled in Nudge.",
  });
}

Deno.serve(async (req) => {
  const denied = requireInternalSecret(req);
  if (denied) return denied;

  // Cron sends {}. Manual runs may send { user_id, month: "YYYY-MM", dry_run }
  let opts: { user_id?: string; month?: string; dry_run?: boolean } = {};
  try {
    opts = await req.json();
  } catch {
    // empty body is fine
  }
  if (opts.month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(opts.month)) {
    return json({ error: "month must look like 2026-09" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let q = supabase
    .from("settings")
    .select("user_id, timezone, notification_monthly_report");
  if (opts.user_id) q = q.eq("user_id", opts.user_id);

  const { data: users, error: usersError } = await q;
  if (usersError) {
    console.error("Failed to fetch settings:", usersError);
    return json({ error: "Failed to fetch settings" }, 500);
  }

  const out = {
    users: users?.length ?? 0,
    created: 0,
    emailed: 0,
    notDue: 0,
    failed: 0,
    previews: [] as unknown[],
  };
  const now = new Date();

  const release = (id: number) =>
    supabase.from("monthly_reports").update({ emailed_at: null }).eq("id", id);

  for (const u of users ?? []) {
    try {
      const tz = resolveTz(u.timezone);

      let y: number;
      let m: number;
      if (opts.month) {
        [y, m] = opts.month.split("-").map(Number);
      } else {
        const z = zonedParts(tz, now);
        const due = (z.day === 1 && z.hour >= SEND_HOUR) || (z.day >= 2 && z.day <= 3);
        if (!due) {
          out.notDue++;
          continue;
        }
        ({ y, m } = previousMonth(z.year, z.month));
      }
      const monthDate = `${y}-${String(m).padStart(2, "0")}-01`;

      const { data: existing } = await supabase
        .from("monthly_reports")
        .select("id, stats, emailed_at")
        .eq("user_id", u.user_id)
        .eq("month", monthDate)
        .maybeSingle();

      let row = existing;

      if (!row) {
        const stats = await computeStats(supabase, u.user_id, tz, y, m);
        if (opts.dry_run) {
          out.previews.push({ user_id: u.user_id, stats });
          continue;
        }
        const { error: upErr } = await supabase
          .from("monthly_reports")
          .upsert(
            { user_id: u.user_id, month: monthDate, stats },
            { onConflict: "user_id,month", ignoreDuplicates: true }
          );
        if (upErr) throw upErr;

        const { data: fresh } = await supabase
          .from("monthly_reports")
          .select("id, stats, emailed_at")
          .eq("user_id", u.user_id)
          .eq("month", monthDate)
          .maybeSingle();
        row = fresh;
        out.created++;
      } else if (opts.dry_run) {
        out.previews.push({ user_id: u.user_id, stats: row.stats, existing: true });
        continue;
      }

      if (!row) continue;
      const stats = row.stats;

      // Snapshot only: opted out, quiet month, or already emailed
      if (!u.notification_monthly_report || !hasActivity(stats) || row.emailed_at) continue;

      // Claim the email so overlapping runs cannot double-send
      const { data: claimed } = await supabase
        .from("monthly_reports")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", row.id)
        .is("emailed_at", null)
        .select("id");
      if (!claimed || claimed.length === 0) continue;

      const { data: user } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", u.user_id)
        .maybeSingle();

      if (!user?.email) {
        await release(row.id);
        continue;
      }

      const sent = await sendEmail({
        from: "Nudge <reports@nudge.com.ng>",
        to: user.email,
        subject: `Your ${stats.label} in Nudge: ${stats.tasksDone} tasks done`,
        html: buildEmail(user.name ?? "", stats),
      });

      if (!sent.ok) {
        console.error(`Monthly report email failed for ${u.user_id}:`, sent.error);
        await release(row.id);
        out.failed++;
        continue;
      }

      try {
        await sendPushToUser(
          supabase,
          u.user_id,
          JSON.stringify({
            title: `Your ${stats.label} report is ready`,
            body: `${stats.tasksDone} tasks done, ${stats.xpEarned} XP earned.`,
            url: `/reports/${stats.month}`,
            tag: "nudge-monthly-report",
          })
        );
      } catch (err) {
        console.error("Monthly report push failed:", err);
      }

      out.emailed++;
    } catch (err) {
      console.error("Monthly report failed for user:", u.user_id, err);
      out.failed++;
    }
  }

  return json(out);
});