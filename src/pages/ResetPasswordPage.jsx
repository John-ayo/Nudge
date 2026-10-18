import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { updatePassword } from "../lib/auth";
import AuthShell from "../components/auth/AuthShell";
import { Banner, PrimaryButton } from "../components/auth/AuthParts";
import PasswordInput from "../components/PasswordInput";

function linkHasError() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return Boolean(
    hash.get("error") || hash.get("error_code") || query.get("error") || query.get("error_code")
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // checking | ready | invalid | done
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (linkHasError()) {
      setStatus("invalid");
      return;
    }

    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStatus((s) => (s === "done" ? s : "ready"));
      }
    });

    // getSession waits for the client to finish reading the link
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus((s) => (s !== "checking" ? s : data.session ? "ready" : "invalid"));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status !== "done") return;
    const id = setTimeout(() => navigate("/dashboard", { replace: true }), 1800);
    return () => clearTimeout(id);
  }, [status, navigate]);

  const mismatch = Boolean(confirm && confirm !== password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return;
    setError("");
    setLoading(true);
    try {
      await updatePassword(password);
      setStatus("done");
    } catch (err) {
      setError(err.message || "Could not update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      icon="🔐"
      headline={<>Pick a new<br />password.<br />Keep your streak.</>}
      blurb="One quick step and you're back in."
    >
      {status === "checking" && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {status === "invalid" && (
        <div className="text-center">
          <div className="text-5xl mb-6">⏳</div>
          <h1 className="syne text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            This link has expired
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-faint)" }}>
            Reset links work once and expire after a while. Request a new one and try again.
          </p>
          <Link to="/forgot-password" className="text-sm text-[var(--accent)] hover:text-[#8B85FF] transition-colors">
            Get a new link
          </Link>
        </div>
      )}

      {status === "done" && (
        <div className="text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="syne text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Password updated
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-faint)" }}>
            Taking you to your dashboard...
          </p>
        </div>
      )}

      {status === "ready" && (
        <>
          <h1
            className="syne text-4xl lg:text-5xl font-bold leading-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Set a new<br />password
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-faint)" }}>
            Choose something you haven't used before.
          </p>

          {error && <Banner tone="danger">{error}</Banner>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                New password
              </label>
              <PasswordInput
                id="reset-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="reset-confirm" className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                Confirm new password
              </label>
              <PasswordInput
                id="reset-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                invalid={mismatch}
              />
              {mismatch && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>Passwords don't match</p>
              )}
            </div>

            <PrimaryButton loading={loading} loadingLabel="Updating..." disabled={mismatch}>
              Update password
            </PrimaryButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}