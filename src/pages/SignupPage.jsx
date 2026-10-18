import { useState } from "react";
import { Link } from "react-router-dom";
import { signUp, signInWithGoogle } from "../lib/auth";
import AuthShell from "../components/auth/AuthShell";
import { AuthField, Banner, GoogleButton, OrDivider, PrimaryButton } from "../components/auth/AuthParts";
import PasswordInput from "../components/PasswordInput";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordsMismatch = Boolean(confirmPassword && confirmPassword !== password);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setShowAgreementError(true);
      return;
    }
    if (password !== confirmPassword) return;

    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
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
      icon="🚀"
      headline={<>Every win<br />starts with<br />one task.</>}
      blurb="Join people who celebrate their progress and build real momentum."
    >
      {success ? (
        <div className="text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="syne text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Check your email
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-faint)" }}>
            We sent a confirmation link to <span style={{ color: "var(--text-primary)" }}>{email}</span>. Click it to activate your account and start your streak.
          </p>
          <Link to="/login" className="text-sm text-[var(--accent)] hover:text-[#8B85FF] transition-colors">
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <h1
            className="syne text-4xl lg:text-5xl font-bold leading-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Create your<br />account
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-faint)" }}>
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--accent)] hover:text-[#8B85FF] transition-colors">
              Log in
            </Link>
          </p>

          {error && <Banner tone="danger">{error}</Banner>}

          <GoogleButton onClick={handleGoogle} />
          <OrDivider />

          <form onSubmit={handleSignup} className="space-y-4">
            <AuthField
              id="signup-name"
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />

            <AuthField
              id="signup-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />

            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                Confirm Password
              </label>
              <PasswordInput
                id="signup-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                invalid={passwordsMismatch}
              />
              {passwordsMismatch && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>Passwords don't match</p>
              )}
            </div>

            <div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setShowAgreementError(false);
                  }}
                  className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                  style={{ accentColor: "var(--accent)" }}
                />
                <label htmlFor="agree-terms" className="text-xs leading-relaxed cursor-pointer" style={{ color: "var(--text-muted)" }}>
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[#8B85FF] underline transition-colors">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[#8B85FF] underline transition-colors">
                    Privacy Policy
                  </Link>.
                </label>
              </div>
              {showAgreementError && (
                <p className="text-xs mt-2 ml-7" style={{ color: "var(--danger)" }}>
                  You need to agree to the Terms and Privacy Policy to create an account.
                </p>
              )}
            </div>

            <PrimaryButton
              loading={loading}
              loadingLabel="Creating account..."
              disabled={passwordsMismatch}
              style={{
                opacity: !agreedToTerms && !loading && !passwordsMismatch ? 0.45 : undefined,
                cursor: !agreedToTerms ? "not-allowed" : undefined,
              }}
            >
              Create My Account
            </PrimaryButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}