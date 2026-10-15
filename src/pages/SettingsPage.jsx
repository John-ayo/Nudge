import { useAccent } from "../context/AccentContext";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import GithubConnect from "../components/GithubConnect";
import {
  fetchSettings,
  updateSettings,
  updateProfile,
  updatePassword,
  exportTasksCSV,
  clearAllTasks,
  deleteAccount,
} from "../lib/settings";
import { subscribeToPush, isPushSupported } from "../lib/push";

const MenuIcon     = () => (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const UploadIcon   = () => (<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const DownloadIcon = () => (<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const CheckIcon    = () => (<svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>);
const SpinnerIcon  = () => (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ animation:"spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>);
const AlertIcon    = () => (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);

const ACCENT_COLORS = ["#6C63FF","#EF4444","#10B981","#F59E0B","#06B6D4","#F97316","#EC4899","#8B5CF6"];

const FOCUS_OPTIONS = [
  { label: "15m", value: 15 },
  { label: "25m", value: 25 },
  { label: "45m", value: 45 },
  { label: "60m", value: 60 },
];

// These three toggles depend on a working push subscription.
// streakAlert is a local check and celebrationSfx is unrelated to push,
// so neither needs to trigger the permission flow.
const PUSH_NOTIF_KEYS = ["dailyReminder", "dueDateWarning", "weeklyPride"];

function Toggle({ on, onChange, accent = "var(--accent)" }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ backgroundColor: on ? accent : "var(--bg-subtle)" }}>
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
        style={{ left: on ? "calc(100% - 22px)" : "2px" }}/>
    </button>
  );
}

function Section({ title, sub, children }) {
  return (
    <div className="rounded-2xl p-6 mb-5"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)" }}>
      <h3 className="font-bold text-base mb-0.5"
        style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
        {title}
      </h3>
      {sub && <p className="text-xs mb-5" style={{ color: "var(--text-faint)" }}>{sub}</p>}
      {!sub && <div className="mb-4"/>}
      {children}
    </div>
  );
}

function NotifRow({ label, sub, on, onChange, accent }) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>{sub}</p>
      </div>
      <Toggle on={on} onChange={onChange} accent={accent}/>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl p-6 w-full max-w-sm"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid #3f1f1f" }}>
        <div className="flex items-center gap-3 mb-3" style={{ color: "#f87171" }}>
          <AlertIcon/>
          <h3 className="font-bold text-base" style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
            {title}
          </h3>
        </div>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: "transparent", border: "1px solid var(--border-base)", color: "var(--text-muted)" }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all hover:opacity-80"
            style={{ backgroundColor: "#2d0f0f", border: "1px solid #7f1d1d", color: "#f87171" }}>
            {loading && <SpinnerIcon/>}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg"
      style={{
        backgroundColor: type === "success" ? "#0d2b1a" : "#2d0f0f",
        border: `1px solid ${type === "success" ? "#166534" : "#7f1d1d"}`,
        color: type === "success" ? "#4ade80" : "#f87171",
        animation: "slideUp 0.3s ease",
      }}>
      {type === "success" ? <CheckIcon/> : <AlertIcon/>}
      {message}
    </div>
  );
}

export default function SettingsPage({ onMenuOpen, user }) {
  const { updateAccent, updateTheme } = useAccent();

  const [pageLoading,  setPageLoading]  = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);
  const [modal,        setModal]        = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [avatarFile,   setAvatarFile]   = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [email,       setEmail]       = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [notifs, setNotifs] = useState({
    dailyReminder:  true,
    streakAlert:    true,
    dueDateWarning: true,
    weeklyPride:    false,
    celebrationSfx: true,
  });
  const [reminderTime, setReminderTime] = useState("08:00");

  const [accent,    setAccent]    = useState("var(--accent)");
  const [theme,     setTheme]     = useState("dark");
  const [dailyGoal, setDailyGoal] = useState(5);
  const [focusMins, setFocusMins] = useState(25);

  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      setPageLoading(true);
      try {
        setDisplayName(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "");
        setEmail(user.email ?? "");
        if (user.user_metadata?.avatar_url) setAvatarPreview(user.user_metadata.avatar_url);

        const s = await fetchSettings(user.id);
        if (s) {
          setNotifs({
            dailyReminder:  s.notification_daily_reminder   ?? true,
            streakAlert:    s.notification_streak_alert     ?? true,
            dueDateWarning: s.notification_due_date_warning ?? true,
            weeklyPride:    s.notification_weekly_pride     ?? false,
            celebrationSfx: s.notification_celebration_sfx ?? true,
          });
          setReminderTime(s.reminder_time  ?? "08:00");
          setAccent(s.accent_color         ?? "var(--accent)");
          setTheme(s.theme                 ?? "dark");
          setDailyGoal(s.daily_goal        ?? 5);
          setFocusMins(s.focus_mins        ?? 25);
        }
      } catch (err) {
        showToast("Failed to load settings", "error");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [user?.id]);

  useEffect(() => { updateAccent(accent); }, [accent]);
  useEffect(() => { localStorage.setItem("nudge_sfx", notifs.celebrationSfx ? "true" : "false"); }, [notifs.celebrationSfx]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Image must be under 2MB", "error"); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  // Turning on a push-dependent toggle triggers the browser permission
  // prompt and saves the subscription. The toggle only flips on if a
  // subscription was actually created. If permission is denied or push
  // is not supported, it stays off and the person sees why. Turning a
  // push toggle off never unsubscribes: the other push toggles may
  // still need this device's subscription.
  async function toggleNotif(key) {
    const turningOn = !notifs[key];

    if (turningOn && PUSH_NOTIF_KEYS.includes(key)) {
      if (!isPushSupported()) {
        showToast("Push notifications aren't supported in this browser", "error");
        return;
      }

      const subscription = await subscribeToPush(user.id);
      if (!subscription) {
        showToast("Enable notifications in your browser to turn this on", "error");
        return;
      }
    }

    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    if (newPass && newPass !== confirmPass) { showToast("Passwords do not match", "error"); return; }
    if (newPass && newPass.length < 6)      { showToast("Password must be at least 6 characters", "error"); return; }

    setSaving(true);
    try {
      if (avatarFile) {
        const ext      = avatarFile.name.split(".").pop();
        const filePath = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        const avatarUrl = urlData.publicUrl;
        await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", user.id);
        await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
        setAvatarFile(null);
      }

      await updateSettings(user.id, {
        notification_daily_reminder:   notifs.dailyReminder,
        notification_streak_alert:     notifs.streakAlert,
        notification_due_date_warning: notifs.dueDateWarning,
        notification_weekly_pride:     notifs.weeklyPride,
        notification_celebration_sfx:  notifs.celebrationSfx,
        reminder_time:                 reminderTime,
        accent_color:                  accent,
        daily_goal:                    dailyGoal,
        focus_mins:                    focusMins,
        theme,
      });

      const originalName  = user.user_metadata?.full_name ?? "";
      const originalEmail = user.email ?? "";
      const nameChanged   = displayName !== originalName;
      const emailChanged  = email !== originalEmail;
      if (nameChanged || emailChanged) {
        await updateProfile({
          displayName: nameChanged  ? displayName : undefined,
          email:       emailChanged ? email       : undefined,
        });
      }

      if (newPass) { await updatePassword(newPass); setNewPass(""); setConfirmPass(""); }
      showToast("Settings saved!", "success");
    } catch (err) {
      showToast(err.message ?? "Failed to save settings", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setNotifs({ dailyReminder: true, streakAlert: true, dueDateWarning: true, weeklyPride: false, celebrationSfx: true });
    setReminderTime("08:00");
    setAccent("#6C63FF");
    setTheme("dark");
    updateTheme("dark");
    setDailyGoal(5);
    setFocusMins(25);
    setNewPass("");
    setConfirmPass("");
  }

  async function handleExport() {
    try {
      const count = await exportTasksCSV(user.id);
      if (count === null) { showToast("No tasks to export", "error"); return; }
      showToast(`Exported ${count} task${count !== 1 ? "s" : ""}`, "success");
    } catch (err) {
      showToast("Export failed", "error");
      console.error(err);
    }
  }

  async function handleClearTasks() {
    setModalLoading(true);
    try {
      await clearAllTasks(user.id);
      setModal(null);
      showToast("All tasks cleared", "success");
    } catch (err) {
      showToast("Failed to clear tasks", "error");
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setModalLoading(true);
    try {
      await deleteAccount();
    } catch (err) {
      showToast("Failed to delete account", "error");
      console.error(err);
      setModalLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--bg-input)",
    border:          "1px solid var(--border-base)",
    color:           "var(--text-primary)",
    borderRadius: "12px", padding: "10px 14px", fontSize: "14px", outline: "none", width: "100%",
  };

  const avatarLetter = displayName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--bg-subtle); border-radius: 4px; }
        [data-theme="dark"] input[type=time]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.4; }
        [data-theme="light"] input[type=time]::-webkit-calendar-picker-indicator { opacity: 0.5; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-5 lg:px-8 py-5"
        style={{ backgroundColor: "var(--bg-base)", borderBottom: "1px solid var(--border-strong)" }}>
        <button onClick={() => onMenuOpen?.()} className="lg:hidden transition-colors"
          style={{ color: "var(--text-muted)" }}>
          <MenuIcon/>
        </button>
        <div>
          <p className="text-xs tracking-widest font-medium" style={{ color: "var(--text-faint)" }}>PREFERENCES</p>
          <h1 className="text-2xl lg:text-3xl font-bold"
            style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>Settings</h1>
        </div>
      </div>

      {pageLoading ? (
        <div className="flex-1 px-5 lg:px-8 py-6 max-w-2xl w-full space-y-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl p-6 h-36"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-base)", animation: "pulse 1.4s ease infinite" }}/>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-5 lg:px-8 py-6 max-w-2xl w-full">

          {/* Account */}
          <Section title="Account">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-14 h-14 flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-14 h-14 rounded-full object-cover"/>
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: accent }}>
                    {avatarLetter}
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-[var(--bg-subtle)] cursor-pointer"
                  style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border-base)", color: "var(--text-primary)", display: "inline-flex" }}>
                  <UploadIcon/> Change Photo
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleAvatarChange}/>
                </label>
                <p className="text-xs mt-1" style={{ color: "var(--text-disabled)" }}>JPG, PNG up to 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest" style={{ color: "var(--text-muted)" }}>
                  DISPLAY NAME
                </label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest" style={{ color: "var(--text-muted)" }}>
                  EMAIL
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest" style={{ color: "var(--text-muted)" }}>
                  NEW PASSWORD
                </label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                  placeholder="Leave blank to keep current" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest" style={{ color: "var(--text-muted)" }}>
                  CONFIRM PASSWORD
                </label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" sub="Control how and when Nudge reaches you">
            <div className="-mt-2">
              <NotifRow label="Daily task reminder"       sub="Get nudged each morning to set your tasks"  on={notifs.dailyReminder}   onChange={() => toggleNotif("dailyReminder")}   accent={accent}/>
              <NotifRow label="Streak alert"              sub="Know when your streak is at risk"           on={notifs.streakAlert}     onChange={() => toggleNotif("streakAlert")}     accent={accent}/>
              <NotifRow label="Due date warning"          sub="Get warned 24 hours, 1 hour and 20 minutes before a task is due" on={notifs.dueDateWarning}  onChange={() => toggleNotif("dueDateWarning")}  accent={accent}/>
              <NotifRow label="Weekly pride report"       sub="A summary of everything you crushed"        on={notifs.weeklyPride}     onChange={() => toggleNotif("weeklyPride")}     accent={accent}/>
              <NotifRow label="Celebration sound effects" sub="Play sounds when you complete tasks"        on={notifs.celebrationSfx}  onChange={() => toggleNotif("celebrationSfx")}  accent={accent}/>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Reminder time:</span>
              <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                className="rounded-xl px-3 py-1.5 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e  => e.target.style.borderColor = "var(--border-base)"}/>
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance" sub="Make Nudge feel like yours">
            <div className="flex items-center justify-between py-3 mb-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Theme</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Switch between dark and light mode</p>
              </div>
              <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: "var(--bg-hover)" }}>
                {["dark","light"].map(t => (
                  <button key={t} onClick={() => { setTheme(t); updateTheme(t); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                    style={{
                      backgroundColor: theme === t ? "var(--bg-subtle)"   : "transparent",
                      color:           theme === t ? "var(--text-primary)" : "var(--text-muted)",
                      border:          theme === t ? "1px solid var(--border-base)" : "1px solid transparent",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>Accent Colour</p>
              <p className="text-xs mb-3" style={{ color: "var(--text-faint)" }}>
                Changes buttons, highlights and active states
              </p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => setAccent(c)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: c,
                      border:    accent === c ? "2.5px solid #fff" : "2.5px solid transparent",
                      transform: accent === c ? "scale(1.15)"      : "scale(1)",
                    }}>
                    {accent === c && <CheckIcon/>}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Productivity */}
          <Section title="Productivity" sub="Tune Nudge to match how you actually work">
            <div className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Daily task goal</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>How many tasks you aim to complete each day</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDailyGoal(g => Math.max(1, g - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:bg-[var(--bg-subtle)]"
                  style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}>
                  -
                </button>
                <span className="font-bold w-6 text-center" style={{ color: "var(--text-primary)" }}>{dailyGoal}</span>
                <button onClick={() => setDailyGoal(g => g + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:bg-[var(--bg-subtle)]"
                  style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}>
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Default focus timer</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>Default duration when you start focus mode</p>
              </div>
              <div className="flex gap-1.5">
                {FOCUS_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setFocusMins(opt.value)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: focusMins === opt.value ? accent             : "var(--bg-hover)",
                      color:           focusMins === opt.value ? "#fff"             : "var(--text-muted)",
                      border:          `1px solid ${focusMins === opt.value ? accent : "var(--border-base)"}`,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>XP per task</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Short tasks earn 50 XP, longer tasks earn 75 XP
                </p>
              </div>
              <span className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: accent }}>
                Auto
              </span>
            </div>
          </Section>

          {/* Integrations */}
          <Section title="GitHub" sub="Turn merged pull requests into XP">
            <GithubConnect accent={accent}/>
          </Section>

          {/* Privacy */}
          <Section title="Privacy and Data" sub="Your data, your control">
            <div className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Export my data</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Download all your tasks and history as a CSV file
                </p>
              </div>
              <button onClick={handleExport}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}>
                <DownloadIcon/> Export CSV
              </button>
            </div>
            <div className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Clear all tasks</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Permanently delete all tasks. This cannot be undone.
                </p>
              </div>
              <button onClick={() => setModal({ type: "clearTasks" })}
                className="rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: theme === "dark" ? "#2d0f0f" : "#fee2e2",
                  border: `1px solid ${theme === "dark" ? "#7f1d1d" : "#fca5a5"}`,
                  color: theme === "dark" ? "#f87171" : "#b91c1c",
                }}>
                Clear Tasks
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "#EF4444" }}>Delete account</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Permanently remove your account and all data
                </p>
              </div>
              <button onClick={() => setModal({ type: "deleteAccount" })}
                className="rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: theme === "dark" ? "#2d0f0f" : "#fee2e2",
                  border: `1px solid ${theme === "dark" ? "#7f1d1d" : "#fca5a5"}`,
                  color: theme === "dark" ? "#f87171" : "#b91c1c",
                }}>
                Delete Account
              </button>
            </div>
          </Section>

          {/* Legal */}
          <Section title="Legal" sub="Review the policies that govern your use of Nudge">
            <div className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Privacy Policy</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  How we collect, use, and protect your data
                </p>
              </div>
              <Link to="/privacy" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}>
                View <ExternalLink size={14}/>
              </Link>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Terms and Conditions</p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  The rules for using the Nudge app
                </p>
              </div>
              <Link to="/terms" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}>
                View <ExternalLink size={14}/>
              </Link>
            </div>
          </Section>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button onClick={handleReset}
              className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: "transparent", border: "1px solid var(--border-base)", color: "var(--text-muted)" }}>
              Reset to defaults
            </button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: accent, opacity: saving ? 0.7 : 1 }}>
              {saving && <SpinnerIcon/>}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      )}

      {modal?.type === "clearTasks" && (
        <ConfirmModal
          title="Clear all tasks?"
          message="This will permanently delete every task you have. Your XP and streaks will not be affected. This action cannot be undone."
          confirmLabel="Yes, clear tasks"
          onConfirm={handleClearTasks}
          onCancel={() => setModal(null)}
          loading={modalLoading}
        />
      )}
      {modal?.type === "deleteAccount" && (
        <ConfirmModal
          title="Delete your account?"
          message="This will permanently delete your account, all tasks, XP, streaks, and settings. You cannot recover this data. This action cannot be undone."
          confirmLabel="Yes, delete everything"
          onConfirm={handleDeleteAccount}
          onCancel={() => setModal(null)}
          loading={modalLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type}/>}
    </div>
  );
}