import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const PR_XP = 30; // tune to your XP economy
export const MAX_XP_PRS_PER_DAY = 3;
export const LOOKBACK_DAYS = 7;

export type GithubLink = { user_id: string; username: string; linked_at: string };

export type SyncResult =
  | { ok: true; newPrs: number; xpPrs: number }
  | { ok: false; githubStatus: number };

export async function syncGithubUser(
  supabase: SupabaseClient,
  link: GithubLink,
  ghToken: string
): Promise<SyncResult> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10);
  const q = `is:pr is:merged author:${link.username} merged:>=${since}`;

  const res = await fetch(
    `https://api.github.com/search/issues?${new URLSearchParams({ q, per_page: "100" })}`,
    {
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "nudge-github-sync",
      },
    }
  );
  if (!res.ok) {
    console.error(`GitHub search failed (${res.status}) for ${link.username}`);
    return { ok: false, githubStatus: res.status };
  }

  const body = await res.json();
  const linkedAt = new Date(link.linked_at).getTime();

  // Only PRs merged after the account was linked, so linking cannot backfill XP
  const prs = (body.items ?? [])
    .map((item: any) => ({
      pr_id: item.id as number,
      repo: String(item.repository_url).replace("https://api.github.com/repos/", ""),
      title: item.title as string,
      merged_at: item.pull_request?.merged_at as string | null,
    }))
    .filter((p: any) => p.merged_at && new Date(p.merged_at).getTime() >= linkedAt)
    .sort((a: any, b: any) => a.merged_at.localeCompare(b.merged_at));

  if (prs.length === 0) return { ok: true, newPrs: 0, xpPrs: 0 };

  const { data: existing } = await supabase
    .from("github_prs")
    .select("pr_id")
    .eq("user_id", link.user_id)
    .in("pr_id", prs.map((p: any) => p.pr_id));
  const seen = new Set((existing ?? []).map((r: any) => r.pr_id));

  const { data: rewarded } = await supabase
    .from("github_prs")
    .select("merged_at")
    .eq("user_id", link.user_id)
    .gt("xp_awarded", 0)
    .gte("merged_at", `${since}T00:00:00Z`);
  const perDay = new Map<string, number>();
  for (const r of rewarded ?? []) {
    const day = String((r as any).merged_at).slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }

  let newPrs = 0;
  let xpPrs = 0;

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

  return { ok: true, newPrs, xpPrs };
}