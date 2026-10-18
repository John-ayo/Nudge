import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn, signInWithGoogle } from "../lib/auth";
import { useLoginThrottle } from "../lib/loginThrottle";
import AuthShell from "../components/auth/AuthShell";
import { AuthField, Banner, GoogleButton, OrDivider, PrimaryButton } from "../components/auth/AuthParts";
import PasswordInput from "../components/PasswordInput";

const isBadCredentials = (err) =>
  err?.code === "invalid_credentials" ||
  /invalid login credentials/i.test(err?.message || "");

const isServerRateLimited = (err) =>
  err?.status === 429 ||
  err?.code === "over_request_rate_limit" ||
  /rate limit/i.test(err?.message || "");

const formatCountdown = (total) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const throttle = useLoginThrottle();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (throttle.checkLocked()) return;

    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      throttle.recordSuccess();
      navigate("/dashboard");
    } catch (err) {
      if (isServerRateLimited(err)) {
        throttle.recordServerLimit();
        setError("Too many attempts. Please wait a minute and try again.");
      } else if (isBadCredentials(err)) {
        const { locked, attemptsLeft } = throttle.recordFailure();
        setError(
          locked
            ? ""
            : `Incorrect email or password. ${attemptsLeft} ${
                attemptsLeft === 1 ? "attempt" : "attempts"
              } left before a short pause.`
        );
      } else {
        setError(err.message || "Login failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <AuthShell
      icon="👋"
      headline={<>Welcome<br />back. Ready<br />to crush it?</>}
      blurb="Your streak is waiting. Your tasks are waiting. Let's go."
    >
      <h1
        className="syne text-4xl lg:text-5xl font-bold leading-tight mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Log in to Nudge
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-faint)" }}>
        Don't have an account?{" "}
        <Link to="/signup" className="text-[var(--accent)] hover:text-[#8B85FF] transition-colors">
          Sign up
        </Link>
      </p>

      {throttle.locked && (
        <Banner tone="warn">
          Too many attempts. Try again in {formatCountdown(throttle.secondsLeft)}.
        </Banner>
      )}
      {error && <Banner tone="danger">{error}</Banner>}

      <GoogleButton onClick={handleGoogle} />
      <OrDivider />

      <form onSubmit={handleLogin} className="space-y-4">
        <AuthField
          id="login-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
        />

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            Password
          </label>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: "var(--text-disabled)" }}>
          By logging in, you agree to our{" "}
          <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[#8B85FF] underline transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[#8B85FF] underline transition-colors">
            Privacy Policy
          </Link>.
        </p>

        <PrimaryButton loading={loading} loadingLabel="Logging in..." disabled={throttle.locked}>
          {throttle.locked
            ? `Try again in ${formatCountdown(throttle.secondsLeft)}`
            : "Log in to Nudge"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}