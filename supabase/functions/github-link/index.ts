import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: full, error: lookupError } = await admin.auth.admin.getUserById(authData.user.id);
  if (lookupError || !full?.user) return json({ error: "Lookup failed" }, 500);

  const github = full.user.identities?.find((i) => i.provider === "github");
  const username = github?.identity_data?.user_name as string | undefined;
  if (!username) return json({ error: "No GitHub account linked" }, 400);

  const { error: upsertError } = await admin
    .from("github_links")
    .upsert({ user_id: authData.user.id, username }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("github_links upsert failed:", upsertError);
    return json({ error: "Could not save link (account may already be linked elsewhere)" }, 409);
  }

  return json({ username });
});