import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nudge_login_throttle";
const MAX_FAILS = 5; // wrong passwords before a pause
const BASE_LOCK_MS = 30 * 1000; // first pause, doubles each round
const MAX_LOCK_MS = 15 * 60 * 1000; // longest pause
const SERVER_LIMIT_LOCK_MS = 60 * 1000; // pause when Supabase says slow down
const FORGET_AFTER_MS = 30 * 60 * 1000; // quiet time before history is cleared

const EMPTY = { fails: 0, strikes: 0, lockedUntil: 0, lastFail: 0 };

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const s = { ...EMPTY, ...JSON.parse(raw) };
    const now = Date.now();
    if (now >= s.lockedUntil && now - s.lastFail > FORGET_AFTER_MS) return { ...EMPTY };
    return s;
  } catch {
    return { ...EMPTY };
  }
}

function write(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage blocked, the throttle just becomes a no-op
  }
}

export function useLoginThrottle() {
  const [lockedUntil, setLockedUntil] = useState(() => read().lockedUntil);
  const [now, setNow] = useState(() => Date.now());

  // Tick while locked so the countdown updates
  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockedUntil) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Pick up a lock set in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      setLockedUntil(read().lockedUntil);
      setNow(Date.now());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  // Re-reads storage, so a stale tab cannot slip past the lock
  const checkLocked = useCallback(() => {
    const s = read();
    if (s.lockedUntil > Date.now()) {
      setLockedUntil(s.lockedUntil);
      setNow(Date.now());
      return true;
    }
    return false;
  }, []);

  const recordFailure = useCallback(() => {
    const s = read();
    const t = Date.now();
    s.fails += 1;
    s.lastFail = t;
    let locked = false;
    if (s.fails >= MAX_FAILS) {
      s.strikes += 1;
      s.fails = 0;
      s.lockedUntil = t + Math.min(BASE_LOCK_MS * 2 ** (s.strikes - 1), MAX_LOCK_MS);
      locked = true;
      setLockedUntil(s.lockedUntil);
      setNow(t);
    }
    write(s);
    return { locked, attemptsLeft: MAX_FAILS - s.fails };
  }, []);

  const recordServerLimit = useCallback(() => {
    const s = read();
    const t = Date.now();
    s.lastFail = t;
    s.lockedUntil = Math.max(s.lockedUntil, t + SERVER_LIMIT_LOCK_MS);
    write(s);
    setLockedUntil(s.lockedUntil);
    setNow(t);
  }, []);

  const recordSuccess = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setLockedUntil(0);
  }, []);

  return {
    locked: secondsLeft > 0,
    secondsLeft,
    checkLocked,
    recordFailure,
    recordServerLimit,
    recordSuccess,
  };
}