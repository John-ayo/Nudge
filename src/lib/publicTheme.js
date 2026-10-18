import { useCallback, useEffect, useState } from "react";

const KEY = "nudge_public_theme";

function getInitial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage blocked
  }
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function usePublicTheme() {
  const [theme, setTheme] = useState(getInitial);

  const toggle = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
  }, [theme]);

  // Keep other tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { theme, toggle };
}