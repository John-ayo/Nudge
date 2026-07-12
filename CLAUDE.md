# CLAUDE.md — Nudge Project Context

This file gives an AI assistant full working context for the Nudge codebase. Read this before touching any file.

---

## What Nudge is

Nudge is a web-first productivity and task management app. The core idea is that completing tasks should feel good. It uses XP, streaks, badges, and push notifications to motivate users. Target users: students, professionals, and anyone who wants to feel celebrated for getting things done.

---

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Hosting:** Vercel
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Email:** Resend
- **Push notifications:** Web Push API + VAPID keys
- **Analytics:** PostHog
- **Icons:** Lucide React only (no emoji as functional icons)
- **Fonts:** DM Sans (body), Syne (headings)

---

## Project structure

```
Nudge/
├── public/
│   ├── manifest.json         PWA manifest
│   ├── sw.js                 Service worker (push notifications)
│   ├── nudge-icon-192.png    PWA icon
│   ├── nudge-icon-512.png    PWA icon
│   └── nudge-favicon-dark.svg
├── src/
│   ├── main.jsx              Entry point, BrowserRouter lives here
│   ├── App.jsx               Routes, sidebar logic, auth gate
│   ├── components/
│   │   ├── Sidebar.jsx       Shared sidebar with Lucide icons
│   │   ├── BadgeIcon.jsx     SVG badge illustrations
│   │   ├── BadgeModal.jsx    Badge unlock pop-in animation
│   │   ├── InstallPrompt.jsx PWA install banner
│   │   ├── ScrollReveal.jsx  Scroll animation wrapper
│   │   └── ErrorBoundary.jsx App-level error boundary
│   ├── context/
│   │   ├── AuthContext.jsx   Supabase auth state
│   │   ├── TasksContext.jsx  Tasks, categories, badges, XP state
│   │   └── AccentContext.jsx Theme and accent color state
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── MyTasksPage.jsx
│   │   ├── CategoriesPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── FocusPage.jsx
│   │   ├── TermsPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── ServerErrorPage.jsx
│   └── lib/
│       ├── supabase.js       Supabase client (has env variable guard)
│       ├── tasks.js          Tasks CRUD
│       ├── categories.js     Categories CRUD
│       ├── xp.js             XP fetching
│       ├── streaks.js        Streak fetching
│       ├── badges.js         Badge definitions (BADGE_LIST)
│       ├── settings.js       Settings CRUD, exportTasksCSV, clearAllTasks
│       └── push.js           Push subscription logic
└── supabase/
    └── functions/
        ├── complete-task/
        ├── streak-cron/
        ├── send-push/
        ├── daily-reminder/
        ├── due-date-warning/
        └── weekly-pride/
```

---

## Routing

`BrowserRouter` lives in `main.jsx`. `App.jsx` uses `Routes` only.

`NO_SIDEBAR` array in `App.jsx` hides the sidebar on these routes:
`/`, `/login`, `/signup`, `/500`, `/focus`, `/terms`, `/privacy`

All pages receive `onMenuOpen` and `user` as props.

---

## Database tables

All in `public` schema. New tables always need explicit GRANTs:
```sql
GRANT ALL ON public.table_name TO authenticated;
GRANT ALL ON public.table_name TO service_role;
```

### users
`id, email, name, avatar_url, created_at`

### tasks
`id, user_id, title, priority (low/medium/high), done (boolean), due_date (timestamptz), est (integer minutes), cat (uuid), category_id (uuid), created_at, updated_at`

Note: `updated_at` is explicitly set on every `updateTask()` call. The pride chart depends on this.

### categories
`id, user_id, name, icon (lucide key string), color (hex), created_at`

### xp_log
`id, user_id, task_id, amount (integer), reason (text), created_at`

### streaks
`id, user_id, current (integer), best (integer), grace_used (boolean), last_active (timestamptz)`

### badges
`id, user_id, badge_id (text), unlocked_at (timestamptz)`

Badge keys: `first_blood`, `on_a_roll`, `unstoppable`, `century`, `xp_hunter`, `speed_demon`, `centurion`

### settings
`id, user_id, reminder_time (text default 08:00), timezone (text default Africa/Lagos), theme (text), accent_color (text), daily_goal (integer), focus_mins (integer), notification_daily_reminder (boolean), notification_streak_alert (boolean), notification_due_date_warning (boolean), notification_weekly_pride (boolean), notification_celebration_sfx (boolean), streak_protection (boolean)`

### push_subscriptions
`id, user_id, endpoint (text), p256dh (text), auth (text)`

### notification_log
`id, user_id, task_id (nullable), type (text), sent_at (timestamptz)`

Used to prevent duplicate notifications. Types: `daily_reminder_YYYY-MM-DD`, `due_24h`, `due_1h`, `due_20m`.

---

## Edge functions

All written in Deno TypeScript. Located in `supabase/functions/`.

All functions use `SUPABASE_SERVICE_ROLE_KEY` (not anon key) to bypass RLS.

### complete-task
Called when a task is toggled done. Awards XP (50 or 75 based on est), updates streak, checks and unlocks badges.

### streak-cron
Runs daily via pg_cron. Resets streaks for users who missed a day (respects grace_used).

### send-push
HTTP POST. Accepts `user_id, title, body, url, tag`. Sends push to all of that user's subscriptions. Cleans up expired subscriptions (410/404 responses).

### daily-reminder
Runs every minute via pg_cron. Checks which users have `notification_daily_reminder = true` and whose `reminder_time` matches the current time in their `timezone`. Deduped via `notification_log` (one per user per day).

### due-date-warning
Runs every minute via pg_cron. Finds incomplete tasks with due dates. Fires at 3 windows: 24h (23.5-24.5h), 1h (50-70min), 20min (15-25min). Each window fires once per task via `notification_log`.

### weekly-pride
Runs Saturday 18:00 UTC (7 PM WAT) via pg_cron. Fetches each user's weekly stats (tasks done via `updated_at`, XP from `xp_log`, badges from `badges.unlocked_at`, streak from `streaks.current`). Sends HTML email via Resend + push notification. From address uses `onboarding@resend.dev` until custom domain is verified.

---

## pg_cron jobs

```sql
-- Check registered jobs
SELECT jobname, schedule, active FROM cron.job;
```

Jobs: `nudge-daily-reminder` (every minute), `nudge-due-date-warning` (every minute), `nudge-weekly-pride` (0 18 * * 6), `streak-reset-daily` (0 0 * * *), `daily-streak-reset` (0 0 * * *)

---

## Design system

All colors use CSS variables defined in `AccentContext.jsx` and applied via `data-theme` on `document.documentElement`.

| Variable | Dark | Light |
|---|---|---|
| `--bg-base` | `#000` | `#f9f9f9` |
| `--bg-card` | `#0d0d0d` | `#ffffff` |
| `--bg-input` | `#111` | `#f1f1f1` |
| `--bg-subtle` | `#1a1a1a` | `#e5e5e5` |
| `--bg-hover` | `#1f1f1f` | `#ececec` |
| `--text-primary` | `#f5f5f5` | `#0a0a0a` |
| `--text-muted` | `#888` | `#555` |
| `--text-faint` | `#555` | `#888` |
| `--text-disabled` | `#333` | `#bbb` |
| `--border-base` | `#222` | `#ddd` |
| `--accent` | set by user, default `#6C63FF` | same |

Status chips and pills are always theme-aware. Never hardcode dark background colors without a light mode equivalent.

---

## Service worker (sw.js)

Located at `public/sw.js`. Handles push events and notification clicks. Key settings:
- `icon: "/nudge-icon-192.png"`
- `requireInteraction: true`
- `tag` from push payload or defaults to `"nudge-general"`
- Notification click navigates to `data.url` or `/dashboard`

---

## PWA

`public/manifest.json` defines the PWA. Icons: `nudge-icon-192.png` and `nudge-icon-512.png`. `InstallPrompt.jsx` handles the `beforeinstallprompt` event for Android and desktop install banners. iOS requires manual Add to Home Screen on Safari (iOS 16.4+).

---

## Context providers

### AuthContext
Wraps the app. Provides `user` (Supabase auth user object). Handles session persistence and Google OAuth.

### TasksContext
Provides `tasks, categories, badges, loading, toggleTask, addTask, editTask, removeTask`. `toggleTask` calls the `complete-task` edge function and receives `xp_awarded, new_streak, badges_unlocked` in response. `totalXP` updates directly from edge function response.

### AccentContext
Provides `accent, theme, updateAccent, updateTheme`. Hydrates from Supabase settings on login. Applies theme to `document.documentElement` via `data-theme` attribute.

---

## Working conventions

- Always use `lucide-react` for icons. No emoji as functional icons.
- All pages are standalone JSX files. No shared layout component except `Sidebar.jsx`.
- Tailwind CSS utility classes inside JSX. No separate CSS files.
- When adding a new Supabase table, always run GRANTs immediately.
- `updated_at` must be explicitly set in `updateTask()`. Do not rely on Supabase defaults.
- Edge function secrets live in Supabase dashboard only. Never in `.env` or frontend code.
- `.env` only needs `VITE_SUPABASE_URL` `VITE_POSTHOG_KEY` and `VITE_SUPABASE_ANON_KEY`.
- The pride chart in `ProfilePage.jsx` uses `updated_at WHERE done = true` as a proxy for completion date.
- `notification_log` is the dedup mechanism for all scheduled notifications. Always insert a log entry after a successful send.

---

## Known pending

- Custom domain verification in Resend (weekly-pride email currently sends from `onboarding@resend.dev`)
- Proper square app icon (current icon is the wordmark cropped, needs a dedicated square icon design)
- AI task assistant (v2 roadmap, Claude or Gemini via edge function)