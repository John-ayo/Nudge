export const BRAND = {
  name: "Nudge",
  accent: "#6C63FF",
  appUrl: "https://nudge.com.ng",
  settingsUrl: "https://nudge.com.ng/settings",
  // Leave undefined until you have a mailbox that really receives mail.
  replyTo: undefined as string | undefined,
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EmailParts = {
  title: string;
  preheader?: string;
  emoji?: string;
  heading: string;
  intro?: string;
  // Trusted HTML. The caller must escape any user data inside it.
  bodyHtml?: string;
  quote?: string;
  cta?: { label: string; href: string };
  footerNote: string;
};

// heading, intro, quote, cta and footerNote are plain text and get escaped here.
export function renderEmail(p: EmailParts): string {
  const a = BRAND.accent;
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${e(p.title)}</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:'DM Sans',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(p.preheader ?? "")}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0d0d0d;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;">
        <tr><td style="background:#000;padding:32px 40px 24px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
            <span style="color:${a};">Nu</span><span style="color:#F5F5F5;">dge</span>
          </p>
        </td></tr>
        <tr><td style="padding:36px 40px 0;">
          ${p.emoji ? `<p style="margin:0 0 16px;font-size:40px;">${p.emoji}</p>` : ""}
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#F5F5F5;line-height:1.3;">${e(p.heading)}</h1>
          ${p.intro ? `<p style="margin:12px 0 0;color:#888;font-size:15px;line-height:1.6;">${e(p.intro)}</p>` : ""}
        </td></tr>
        ${p.bodyHtml ? `<tr><td style="padding:28px 40px 0;">${p.bodyHtml}</td></tr>` : ""}
        ${p.quote ? `<tr><td style="padding:28px 40px 0;">
          <div style="background:#0d0d1a;border-left:3px solid ${a};border-radius:0 8px 8px 0;padding:16px 20px;">
            <p style="margin:0;color:#c0bdf5;font-size:15px;line-height:1.6;font-style:italic;">"${e(p.quote)}"</p>
          </div>
        </td></tr>` : ""}
        ${p.cta ? `<tr><td style="padding:32px 40px 40px;text-align:center;">
          <a href="${e(p.cta.href)}" style="display:inline-block;background:${a};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;">${e(p.cta.label)}</a>
        </td></tr>` : `<tr><td style="padding:20px;"></td></tr>`}
        <tr><td style="background:#000;padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
          <p style="margin:0;color:#444;font-size:12px;">${e(p.footerNote)}</p>
          <p style="margin:8px 0 0;color:#444;font-size:12px;">
            <a href="${e(BRAND.settingsUrl)}" style="color:#666;">Manage email preferences</a>
          </p>
          <p style="margin:8px 0 0;color:#333;font-size:12px;">&copy; ${new Date().getFullYear()} Nudge. Built for doers.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(o: {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error: string | null }> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: o.from,
      to: [o.to],
      subject: o.subject,
      html: o.html,
      reply_to: o.replyTo ?? BRAND.replyTo,
    }),
  });

  return { ok: res.ok, error: res.ok ? null : await res.text() };
}