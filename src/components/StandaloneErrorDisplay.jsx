/**
 * Standalone error display component that doesn't depend on Router or Context
 * Used by ErrorBoundary when other systems fail
 */
export function StandaloneErrorDisplay() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;}`}</style>

      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.02,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: "32px", left: "32px" }}>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "bold",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          <span style={{ color: "white" }}>Nudge</span>
          <span style={{ color: "var(--accent, #6C63FF)" }}>.</span>
        </button>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "448px" }}>
        {/* Icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EF444422",
              border: "1px solid #EF444444",
            }}
          >
            <span style={{ fontSize: "36px" }}>⚠️</span>
          </div>
        </div>

        {/* 500 */}
        <p
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#EF4444",
            fontFamily: "'Syne', sans-serif",
            opacity: 0.2,
          }}
        >
          500
        </p>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "12px",
            marginTop: "-16px",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: "14px",
            lineHeight: "1.5",
            marginBottom: "32px",
          }}
        >
          Our server hit a snag. This isn't your fault. We're on it. Try refreshing or head back to the home page.
        </p>

        {/* Error detail box */}
        <div
          style={{
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "32px",
            textAlign: "left",
            backgroundColor: "#161616",
            border: "1px solid #2a2a2a",
          }}
        >
          <p style={{ color: "#9CA3AF", fontSize: "12px", fontFamily: "monospace" }}>
            Error: Internal Server Error (500)
          </p>
          <p style={{ color: "#6B7280", fontSize: "12px", fontFamily: "monospace", marginTop: "4px" }}>
            If this keeps happening, contact support.
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => window.location.reload()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "16px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "white",
              backgroundColor: "var(--accent, #6C63FF)",
              border: "none",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            🔄 Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "16px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#9CA3AF",
              backgroundColor: "transparent",
              border: "1px solid #2a2a2a",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.borderColor = "#444")}
            onMouseOut={(e) => (e.target.style.borderColor = "#2a2a2a")}
          >
            🏠 Go to Home
          </button>
        </div>
      </div>

      <p style={{ position: "absolute", bottom: "32px", color: "#374151", fontSize: "12px" }}>
        © 2026 Nudge. Built for doers.
      </p>
    </div>
  );
}
