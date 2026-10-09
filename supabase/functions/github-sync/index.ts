import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GH_TOKEN = Deno.env.get("GH_API_TOKEN")!;

const PR_XP = 30;            // tune to your XP economy
const MAX_XP_PRS_PER_DAY = 3;
const LOOKBACK_DAYS = 7;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.headers.get("Authorization") !== `Bearer ${SERVICE_KEY}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10);

  const { data: links, error: linksError } = await supabase
    .from("github_links")
    .select("user_id, username, linked_at");
  if (linksError) return json({ error: "Failed to load links" }, 500);
  if (!links || links.length === 0) return json({ skipped: "no linked users" });

  let newPrs = 0;
  let xpPrs = 0;
  let failed = 0;

  for (const link of links) {
    try {
      const q = `is:pr is:merged author:${link.username} merged:>=${since}`;
      const res = await fetch(
        `https://api.github.com/search/issues?${new URLSearchParams({ q, per_page: "100" })}`,
        {
          headers: {
            Authorization: `Bearer ${GH_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "nudge-github-sync",
          },
        }
      );
      if (!res.ok) {
        console.error(`GitHub search failed (${res.status}) for ${link.username}`);
        failed++;
        continue;
      }

      const body = await res.json();
      const linkedAt = new Date(link.linked_at).getTime();

      // Only PRs merged after the account was linked, so linking can't backfill XP
      const prs = (body.items ?? [])
        .map((item: any) => ({
          pr_id: item.id as number,
          repo: String(item.repository_url).replace("https://api.github.com/repos/", ""),
          title: item.title as string,
          merged_at: item.pull_request?.merged_at as string | null,
        }))
        .filter((p: any) => p.merged_at && new Date(p.merged_at).getTime() >= linkedAt)
        .sort((a: any, b: any) => a.merged_at.localeCompare(b.merged_at));

      if (prs.length === 0) continue;

      const { data: existing } = await supabase
        .from("github_prs")
        .select("pr_id")
        .eq("user_id", link.user_id)
        .in("pr_id", prs.map((p: any) => p.pr_id));
      const seen = new Set((existing ?? []).map((r) => r.pr_id));

      const { data: rewarded } = await supabase
        .from("github_prs")
        .select("merged_at")
        .eq("user_id", link.user_id)
        .gt("xp_awarded", 0)
        .gte("merged_at", `${since}T00:00:00Z`);
      const perDay = new Map<string, number>();
      for (const r of rewarded ?? []) {
        const day = String(r.merged_at).slice(0, 10);
        perDay.set(day, (perDay.get(day) ?? 0) + 1);
      }

      for (const pr of prs) {
        if (seen.has(pr.pr_id)) continue;

        const day = pr.merged_at.slice(0, 10); // UTC day
        const count = perDay.get(day) ?? 0;
        const xp = count < MAX_XP_PRS_PER_DAY ? PR_XP : 0;

        const { error: insertError } = await supabase.from("github_prs").insert({
          user_id: link.user_id,
          pr_id: pr.pr_id,
          repo: pr.repo,
          title: pr.title,
          merged_at: pr.merged_at,
          xp_awarded: xp,
        });
        if (insertError) {
          if (insertError.code !== "23505") console.error("PR insert failed:", insertError);
          continue;
        }
        newPrs++;

        if (xp > 0) {
          const { error: xpError } = await supabase.from("xp_log").insert({
            user_id: link.user_id,
            amount: xp,
            reason: "github_pr",
          });
          if (xpError) {
            console.error("xp_log insert failed:", xpError);
          } else {
            perDay.set(day, count + 1);
            xpPrs++;
          }
        }
      }

      // GitHub search allows about 30 requests a minute
      await new Promise((r) => setTimeout(r, 2100));
    } catch (err) {
      console.error(`Sync error for ${link.username}:`, err);
      failed++;
    }
  }

  return json({ newPrs, xpPrs, failed });
});