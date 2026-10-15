import { createClient } from "npm:@supabase/supabase-js@2";
import { syncGithubUser } from "../_shared/github.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GH_TOKEN = Deno.env.get("GH_API_TOKEN")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_SECRET");

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  // Server-to-server only. Fails closed if the secret is not configured.
  if (!INTERNAL_SECRET || req.headers.get("x-internal-secret") !== INTERNAL_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

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
      const result = await syncGithubUser(supabase, link, GH_TOKEN);
      if (result.ok) {
        newPrs += result.newPrs;
        xpPrs += result.xpPrs;
      } else {
        failed++;
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