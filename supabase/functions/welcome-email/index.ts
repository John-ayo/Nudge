import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function buildWelcomeEmail(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to Nudge</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0d0d0d;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:32px 40px 24px;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#6C63FF;">Nu</span><span style="color:#F5F5F5;">dge</span>
              </p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="margin:0;font-size:40px;">🎉</p>
              <h1 style="margin:16px 0 8px;font-size:28px;font-weight:700;color:#F5F5F5;line-height:1.3;">
                Welcome to Nudge, ${firstName}.
              </h1>
              <p style="margin:0;color:#888;font-size:15px;line-height:1.6;">
                You just made a decision to stop surviving your tasks and start celebrating them. That's worth something.
              </p>
            </td>
          </tr>

          <!-- What to expect -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.5px;">
                Here's what's waiting for you
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  { icon: "✅", title: "Tasks that feel good to complete", desc: "Every task you finish is celebrated, not just checked off." },
                  { icon: "🔥", title: "Streaks that keep you consistent", desc: "Build daily momentum and watch your streak grow." },
                  { icon: "⚡", title: "XP and badges for real progress", desc: "Level up as you work. Your effort gets recognized." },
                  { icon: "📊", title: "Weekly pride report every Saturday", desc: "A summary of everything you crushed, straight to your inbox." },
                ].map(item => `
                <tr>
                  <td style="padding:0 0 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;font-size:20px;">${item.icon}</td>
                        <td>
                          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#F5F5F5;">${item.title}</p>
                          <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">${item.desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px 40px;text-align:center;">
              <a href="https://nudge-ochre.vercel.app/dashboard"
                style="display:inline-block;background:#6C63FF;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 36px;border-radius:10px;">
                Open Nudge and start your first task
              </a>
              <p style="margin:20px 0 0;color:#444;font-size:13px;line-height:1.6;font-style:italic;">
                "The hardest part is starting. So start small."
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#000;padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
              <p style="margin:0;color:#333;font-size:12px;">
                &copy; 2026 Nudge. Built for doers.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Supabase auth webhooks send the user object under payload.record
    const user = payload.record ?? payload;
    const email = user.email;
    const fullName = user.raw_user_meta_data?.full_name ?? user.email?.split("@")[0] ?? "there";
    const firstName = fullName.split(" ")[0];

    if (!email) {
      return new Response(JSON.stringify({ error: "No email found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nudge <onboarding@resend.dev>",
        to: [email],
        subject: `Welcome to Nudge, ${firstName}. Let's get to work.`,
        html: buildWelcomeEmail(firstName),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});