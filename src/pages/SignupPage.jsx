import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, signInWithGoogle } from "../lib/auth";

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
  const navigate = useNavigate();

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

  const inputBase =
    "w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200 text-white placeholder-[#555]";

  const submitDisabled = loading || Boolean(confirmPassword && confirmPassword !== password);

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
      `}</style>

      {/* LEFT PANEL */}
      <div
        className="relative lg:w-[45%] flex flex-col justify-between p-8 lg:p-14 min-h-[280px] lg:min-h-screen overflow-hidden"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none opacity-15"
          style={{
            background: "radial-gradient(circle,var(--accent) 0%,transparent 70%)",
            transform: "translate(-35%,35%)",
          }}
        />

        <div className="relative z-10">
          <span className="text-2xl font-bold" style={{ fontFamily: "'Syne',sans-serif" }}>
            <span className="text-white">Nudge</span>
            <span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>

        <div className="relative z-10 my-10 lg:my-0">
          <div className="text-5xl mb-6">🚀</div>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            Every win<br />starts with<br />one task.
          </h2>
          <p className="text-[#777] text-sm mb-8 max-w-xs leading-relaxed">
            Join people who celebrate their progress and build real momentum.
          </p>
          <div className="space-y-3">
            {[
              { icon: "🎉", label: "Celebrate every completed task" },
              { icon: "🔥", label: "Build daily streaks and earn xp" },
              { icon: "🟢", label: "See your progress and feel proud" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-[#999] text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[#3a3a3a] text-xs">© 2026 Nudge. Built for doers.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-[440px]">

          {/* Success state */}
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-6">📬</div>
              <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>
                Check your email
              </h1>
              <p className="text-[#666] text-sm leading-relaxed mb-6">
                We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account and start your streak.
              </p>
              <Link
                to="/login"
                className="text-sm text-[var(--accent)] hover:text-[#8B85FF] transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1
                className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-2"
                style={{ fontFamily: "'Syne',sans-serif" }}
              >
                Create your<br />account
              </h1>
              <p className="text-[#666] text-sm mb-8">
                Already have an account?{" "}
                <Link to="/login" className="text-[var(--accent)] hover:text-[#8B85FF] transition-colors">
                  Log in
                </Link>
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-400 border border-red-400/20"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
                  {error}
                </div>
              )}

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full rounded-2xl py-3 px-4 flex items-center justify-center gap-3 text-sm font-medium text-white border border-[#2a2a2a] hover:border-[var(--accent)]/40 transition-all duration-200 mb-6"
                style={{ backgroundColor: "#161616" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#1f1f1f]" />
                <span className="text-[#444] text-xs">or</span>
                <div className="flex-1 h-px bg-[#1f1f1f]" />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#999] mb-2">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    required
                    className={inputBase}
                    style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,99,255,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#999] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className={inputBase}
                    style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,99,255,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#999] mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputBase}
                    style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,99,255,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#999] mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputBase}
                    style={{
                      backgroundColor: "#161616",
                      border: `1px solid ${confirmPassword && confirmPassword !== password ? "#EF4444" : "#2a2a2a"}`,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,99,255,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = confirmPassword && confirmPassword !== password ? "#EF4444" : "#2a2a2a"; e.target.style.boxShadow = "none"; }}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                  )}
                </div>

                {/* Terms agreement */}
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
                    <label htmlFor="agree-terms" className="text-xs text-[#999] leading-relaxed cursor-pointer">
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
                    <p className="text-red-400 text-xs mt-2 ml-7">
                      You need to agree to the Terms and Privacy Policy to create an account.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="w-full rounded-2xl py-3 text-sm font-bold text-white transition-all duration-200 mt-2 hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--accent)",
                    opacity: !agreedToTerms && !submitDisabled ? 0.45 : undefined,
                    cursor: !agreedToTerms ? "not-allowed" : undefined,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating account...
                    </span>
                  ) : "Create My Account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}