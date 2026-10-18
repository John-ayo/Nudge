export default function ThemeToggle({ theme, onToggle, className = "" }) {
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className={`p-2 rounded-xl border border-[color:var(--border-base)] text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--accent)] transition-colors ${className}`}
    >
      {isLight ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}