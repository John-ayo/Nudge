import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { fetchSettings } from "../lib/settings";

const AccentContext = createContext(null);

export function AccentProvider({ children }) {
  const { user } = useAuth();

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

  // Hydrate from Supabase once the user is known.
  // localStorage already painted a value synchronously on first render,
  // so this only overwrites it if the account has a different saved preference
  // (e.g. first login on a new device, or localStorage was cleared).
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    fetchSettings(user.id)
      .then(s => {
        if (cancelled || !s) return;
        if (s.theme && s.theme !== theme) {
          setTheme(s.theme);
          localStorage.setItem("nudge_theme", s.theme);
        }
        if (s.accent_color && s.accent_color !== accent) {
          setAccent(s.accent_color);
          localStorage.setItem("nudge_accent", s.accent_color);
        }
      })
      .catch(() => {
        // Silent fail — keep whatever localStorage/default already applied.
      });

    return () => { cancelled = true; };
  }, [user?.id]);

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