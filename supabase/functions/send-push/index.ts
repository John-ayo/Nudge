import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3.6.7";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY     = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY    = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT        = Deno.env.get("VAPID_SUBJECT") ?? "mailto:johnpaulthedev@gmail.com";

// Configure web-push once globally
webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: {
    user_id: string;
    title: string;
    body: string;
    url?: string;
    tag?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { user_id, title, body: msgBody, url = "/dashboard", tag = "nudge-general" } = body;

  if (!user_id || !title || !msgBody) {
    return new Response(
      JSON.stringify({ error: "user_id, title, and body are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Service role client bypasses RLS so we can read all subscriptions
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user_id);

  if (fetchError) {
    console.error("Failed to fetch subscriptions:", fetchError);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscriptions" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0, message: "No subscriptions found for this user" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = JSON.stringify({ title, body: msgBody, url, tag });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth:   sub.auth,
        },
      };

      // Trigger the official sendNotification method
      await webPush.sendNotification(pushSubscription, payload);
    })
  );

  // Count outcomes
  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  // Log failures without crashing the whole response
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Push failed for subscription ${i}:`, result.reason);

      // If a subscription is expired or invalid (410 Gone), clean it up
      // so it doesn't keep getting attempted on future sends.
      const reason = result.reason?.toString() ?? "";
      if (reason.includes("410") || reason.includes("404")) {
        supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscriptions[i].endpoint)
          .then(() => console.log("Cleaned up expired subscription:", subscriptions[i].endpoint))
          .catch((err) => console.error("Cleanup failed:", err));
      }
    }
  });

  return new Response(
    JSON.stringify({ sent, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});