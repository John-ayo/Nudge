import { createContext, useContext, useState, useEffect } from "react";

const AccentContext = createContext(null);

export function AccentProvider({ children }) {
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem("nudge_accent") ?? "#6C63FF";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nudge_theme") ?? "dark";
  });

  // Apply accent CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  // Apply theme attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const updateAccent = (color) => {
    setAccent(color);
    localStorage.setItem("nudge_accent", color);
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("nudge_theme", newTheme);
  };

  return (
    <AccentContext.Provider value={{ accent, updateAccent, theme, updateTheme }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used inside AccentProvider");
  return ctx;
}