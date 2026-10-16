import { createClient } from "npm:@supabase/supabase-js@2";
import { syncGithubUser } from "../_shared/github.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GH_TOKEN = Deno.env.get("GH_API_TOKEN")!;

const COOLDOWN_SECONDS = 5 * 60;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json", ...extra },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Identify the caller from their own token
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    console.error("github-sync-me: auth failed:", authError?.message ?? "no user");
    return json({ error: "Unauthorized" }, 401);
  }

  const userId = authData.user.id;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: link, error: linkError } = await admin
    .from("github_links")
    .select("user_id, username, linked_at, last_synced_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (linkError) {
    console.error("github-sync-me: link lookup failed:", linkError);
    return json({ error: "Could not load your GitHub link" }, 500);
  }
  if (!link) {
    console.error("github-sync-me: no github_links row for user", userId);
    return json({ error: "GitHub is not connected" }, 404);
  }

  // Atomic cooldown claim: only one request wins per window
  const { data: claimed, error: claimError } = await admin.rpc("claim_github_sync", {
    p_user: userId,
    p_cooldown_seconds: COOLDOWN_SECONDS,
  });
  if (claimError) {
    console.error("github-sync-me: cooldown claim failed:", claimError);
    return json({ error: "Could not start the sync" }, 500);
  }
  if (!claimed) {
    const last = link.last_synced_at ? new Date(link.last_synced_at).getTime() : Date.now();
    const retryAfter = Math.max(1, Math.ceil((last + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000));
    return json(
      { error: "Please wait before syncing again", retry_after: retryAfter },
      429,
      { "Retry-After": String(retryAfter) }
    );
  }

  try {
    const result = await syncGithubUser(admin, link, GH_TOKEN);
    if (!result.ok) {
      console.error("github-sync-me: GitHub returned status", result.githubStatus);
      return json({ error: "GitHub did not respond. Try again later." }, 502);
    }
    return json({ newPrs: result.newPrs, xpPrs: result.xpPrs });
  } catch (err) {
    console.error("github-sync-me: sync crashed:", err);
    return json({ error: "Sync failed" }, 500);
  }
});