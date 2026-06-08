import { createContext, useContext, useState, useEffect } from "react";

const AccentContext = createContext(null);

export function AccentProvider({ children }) {
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem("nudge_accent") ?? "var(--accent)";
  });

  // Set CSS variable on mount and whenever accent changes
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  const updateAccent = (color) => {
    setAccent(color);
    localStorage.setItem("nudge_accent", color);
  };

  return (
    <AccentContext.Provider value={{ accent, updateAccent }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used inside AccentProvider");
  return ctx;
}