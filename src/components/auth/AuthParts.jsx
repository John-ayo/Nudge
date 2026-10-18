export function fieldClass(invalid = false, padding = "px-4") {
  return [
    "w-full rounded-2xl py-3 text-sm outline-none transition-all duration-200 border",
    padding,
    "bg-[var(--bg-card)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-disabled)]",
    invalid ? "border-[#EF4444]" : "border-[color:var(--border-base)]",
    "focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.12)]",
  ].join(" ");
}

export function AuthField({ id, label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={fieldClass()}
      />
    </div>
  );
}

const TONES = {
  danger: { color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)" },
  warn: { color: "var(--warn)", bg: "var(--warn-bg)", border: "var(--warn-border)" },
  success: { color: "var(--success)", bg: "var(--success-bg)", border: "var(--success-border)" },
};

export function Banner({ tone = "danger", children }) {
  const t = TONES[tone];
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className="mb-4 px-4 py-3 rounded-2xl text-sm border"
      style={{ color: t.color, backgroundColor: t.bg, borderColor: t.border }}
    >
      {children}
    </div>
  );
}

export function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl py-3 px-4 flex items-center justify-center gap-3 text-sm font-medium border border-[color:var(--border-base)] bg-[var(--bg-card)] text-[color:var(--text-primary)] hover:border-[color:var(--accent)] transition-all duration-200 mb-6"
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-base)" }} />
      <span className="text-xs" style={{ color: "var(--text-disabled)" }}>or</span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-base)" }} />
    </div>
  );
}

export function PrimaryButton({ loading = false, loadingLabel = "Please wait...", disabled = false, children, style, ...rest }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full rounded-2xl py-3 text-sm font-bold text-white transition-all duration-200 mt-2 hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: "var(--accent)", ...style }}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}