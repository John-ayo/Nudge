import webPush from "npm:web-push@3.6.7";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

webPush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:johnpaulthedev@gmail.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

type Urgency = "very-low" | "low" | "normal" | "high";

export async function sendPushToUser(
  supabase: SupabaseClient,
  userId: string,
  payload: string,
  opts: { ttl?: number; urgency?: Urgency } = {}
): Promise<{ subscriptions: number; sent: number; failed: number; removed: number }> {
  const { ttl = 86400, urgency = "normal" } = opts;

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error(`Failed to load subscriptions for ${userId}:`, error);
    return { subscriptions: 0, sent: 0, failed: 0, removed: 0 };
  }
  if (!subs || subs.length === 0) {
    return { subscriptions: 0, sent: 0, failed: 0, removed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: ttl, urgency }
        );
        sent++;
      } catch (err) {
        failed++;
        const status = (err as { statusCode?: number }).statusCode;
        console.error(`Push failed (status ${status ?? "unknown"}) for user ${userId}`);
        if (status === 404 || status === 410) expired.push(sub.endpoint);
      }
    })
  );

  if (expired.length > 0) {
    const { error: delError } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expired);
    if (delError) console.error("Cleanup failed:", delError);
  }

  return { subscriptions: subs.length, sent, failed, removed: expired.length };
}