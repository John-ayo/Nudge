import { createClient } from "npm:@supabase/supabase-js@2";
import { sendPushToUser } from "../_shared/push.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_SECRET");

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Server-to-server only. Public anon keys must not be able to push to users.
  // Fails closed if the secret is not configured.
  if (!INTERNAL_SECRET || req.headers.get("x-internal-secret") !== INTERNAL_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  let input: { user_id?: string; title?: string; body?: string; url?: string; tag?: string };
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { user_id, title, body, url = "/dashboard", tag = "nudge-general" } = input;

  if (!user_id || !title || !body) {
    return json({ error: "user_id, title, and body are required" }, 400);
  }

  // Internal paths only, so a notification click can never open an outside site
  if (!url.startsWith("/") || url.startsWith("//")) {
    return json({ error: "url must be an internal path" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const payload = JSON.stringify({
    title: title.slice(0, 100),
    body: body.slice(0, 300),
    url,
    tag,
  });

  const result = await sendPushToUser(supabase, user_id, payload);

  if (result.subscriptions === 0) {
    return json({ sent: 0, message: "No subscriptions found for this user" });
  }

  return json({ sent: result.sent, failed: result.failed, removed: result.removed });
});