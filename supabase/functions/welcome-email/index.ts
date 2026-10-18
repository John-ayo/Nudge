import { createClient } from "npm:@supabase/supabase-js@2";
import { BRAND, renderEmail, sendEmail } from "../_shared/email.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FRESH_SIGNUP_MS = 15 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const FEATURES = [
  { icon: "✅", title: "Tasks that feel good to complete", desc: "Every task you finish is celebrated, not just checked off." },
  { icon: "🔥", title: "Streaks that keep you consistent", desc: "Build daily momentum and watch your streak grow." },
  { icon: "⚡", title: "XP and badges for real progress", desc: "Level up as you work. Your effort gets recognized." },
  { icon: "📊", title: "Weekly pride report every Saturday", desc: "A summary of everything you crushed, straight to your inbox." },
];

function buildBody(): string {
  const items = FEATURES.map(
    (f) => `<table cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr>
      <td style="width:40px;vertical-align:top;padding-top:2px;font-size:20px;">${f.icon}</td>
      <td>
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#F5F5F5;">${f.title}</p>
        <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">${f.desc}</p>
      </td></tr></table>`
  ).join("");

  return `<p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Here's what's waiting for you</p>${items}`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json();
    const claimed = payload.record ?? payload;
    const userId = claimed?.id;
    if (!userId) return json({ error: "No user id" }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Trust Supabase Auth, not the request body
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    const user = data?.user;
    if (error || !user?.email) return json({ error: "User not found" }, 404);

    if (Date.now() - new Date(user.created_at).getTime() > FRESH_SIGNUP_MS) {
      return json({ skipped: "not a new signup" });
    }

    const { data: already } = await supabase
      .from("notification_log")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "welcome")
      .maybeSingle();
    if (already) return json({ skipped: "already welcomed" });

    const meta = user.user_metadata ?? {};
    const fullName: string = meta.full_name ?? meta.name ?? user.email.split("@")[0];
    const firstName = (fullName.trim().split(/\s+/)[0] || "there").slice(0, 40);

    const html = renderEmail({
      title: "Welcome to Nudge",
      preheader: "Your first task is one click away.",
      emoji: "🎉",
      heading: `Welcome to Nudge, ${firstName}.`,
      intro: "You just made a decision to stop surviving your tasks and start celebrating them. That's worth something.",
      bodyHtml: buildBody(),
      quote: "The hardest part is starting. So start small.",
      cta: { label: "Open Nudge and start your first task", href: `${BRAND.appUrl}/dashboard` },
      footerNote: "You're receiving this because you just created a Nudge account.",
    });

    const sent = await sendEmail({
      from: "Nudge <welcome@nudge.com.ng>",
      to: user.email,
      subject: `Welcome to Nudge, ${firstName}. Let's get to work.`,
      html,
    });

    if (!sent.ok) {
      console.error("Resend error:", sent.error);
      return json({ error: "Email provider error" }, 500);
    }

    const { error: logError } = await supabase
      .from("notification_log")
      .insert({ user_id: userId, type: "welcome" });
    if (logError) console.error("Welcome log insert failed:", logError.message);

    return json({ sent: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return json({ error: "Unexpected error" }, 500);
  }
});