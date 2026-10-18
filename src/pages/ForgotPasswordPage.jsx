import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../lib/auth";
import AuthShell from "../components/auth/AuthShell";
import { AuthField, Banner, PrimaryButton } from "../components/auth/AuthParts";

const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_KEY = "nudge_reset_cooldown";

function useCooldown() {
  const [until, setUntil] = useState(() => {
    try {
      return Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= Date.now()) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= until) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [until]);

  const start = () => {
    const u = Date.now() + COOLDOWN_MS;
    try {
      localStorage.setItem(COOLDOWN_KEY, String(u));
    } catch {
      // ignore
    }
    setUntil(u);
    setNow(Date.now());
  };

  return { secondsLeft: Math.max(0, Math.ceil((until - now) / 1000)), start };
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const cooldown = useCooldown();

  const sendReset = async () => {
    if (cooldown.secondsLeft > 0) return;
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      cooldown.start();
      setSent(true);
    } catch (err) {
      if (
        err?.status === 429 ||
        err?.code === "over_email_send_rate_limit" ||
        /rate limit/i.test(err?.message || "")
      ) {
        cooldown.start();
        setError("Too many requests. Please wait a minute and try again.");
      } else {
        setError("Something went wrong. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendReset();
  };

  const waiting = cooldown.secondsLeft > 0;

  return (
    <AuthShell
      icon="🔑"
      headline={<>Locked out?<br />It happens.<br />Let's fix it.</>}
      blurb="Reset your password and get back to your streak."
    >
      {error && <Banner tone="danger">{error}</Banner>}

      {sent ? (
        <div className="text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="syne text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Check your email
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-faint)" }}>
            If an account exists for <span style={{ color: "var(--text-primary)" }}>{email}</span>, we sent a link to reset your password. Check your spam folder too. The link expires, so use it soon.
          </p>
          <button
            type="button"
            onClick={sendReset}
            disabled={waiting || loading}
            className="text-sm text-[var(--accent)] hover:text-[#8B85FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {waiting
              ? `Resend email in ${cooldown.secondsLeft}s`
              : loading
              ? "Sending..."
              : "Resend email"}
          </button>
          <div>
            <Link to="/login" className="text-sm text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)] transition-colors">
              Back to log in
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h1
            className="syne text-4xl lg:text-5xl font-bold leading-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Forgot your<br />password?
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-faint)" }}>
            Enter your email and we'll send you a link to reset it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              id="forgot-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
            <PrimaryButton loading={loading} loadingLabel="Sending..." disabled={waiting}>
              {waiting ? `Try again in ${cooldown.secondsLeft}s` : "Send reset link"}
            </PrimaryButton>
          </form>

          <p className="text-sm mt-6 text-center" style={{ color: "var(--text-faint)" }}>
            Remembered it?{" "}
            <Link to="/login" className="text-[var(--accent)] hover:text-[#8B85FF] transition-colors">
              Log in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}