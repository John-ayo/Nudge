# Nudge

> The productivity app that celebrates you.

Nudge is a web-first task management app built for students, professionals, and anyone who wants to feel motivated and celebrated when completing tasks. It combines streaks, XP, badges, and push notifications to turn productivity into something that actually feels good.

---

## What it does

- Create and manage tasks with priority levels, due dates, estimated time, and categories
- Earn XP and level up as you complete tasks
- Build daily streaks with streak protection (1 grace day per week)
- Unlock badges for milestones (first task, 7-day streak, 100 tasks, and more)
- Get push notifications: daily morning reminder, due date warnings at 24h/1h/20min, and a weekly pride report every Saturday
- Receive a weekly pride email summarising your tasks done, XP earned, streak, and badges unlocked
- Switch between dark and light mode with full theme-aware UI
- Install as a PWA on Android, iOS (home screen), and desktop

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Realtime | Supabase Realtime |
| Edge Functions | Supabase Edge Functions (Deno) |
| Email | Resend |
| Push Notifications | Web Push API + VAPID |
| Analytics | PostHog |
| Icons | Lucide React |
| Fonts | DM Sans (body) + Syne (headings) |

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing Page |
| `/login` | Login |
| `/signup` | Signup |
| `/dashboard` | Dashboard |
| `/tasks` | My Tasks |
| `/categories` | Categories |
| `/calendar` | Calendar |
| `/account` | Profile |
| `/settings` | Settings |
| `/focus` | Focus Timer |
| `/terms` | Terms and Conditions |
| `/privacy` | Privacy Policy |
| `/404` | Not Found |
| `/500` | Server Error |

---

## Database schema

7 tables in the `public` schema:

- `users` - id, email, name, avatar_url, created_at
- `tasks` - id, user_id, title, priority, done, due_date, est, cat, category_id, created_at, updated_at
- `categories` - id, user_id, name, icon, color, created_at
- `xp_log` - id, user_id, task_id, amount, reason, created_at
- `streaks` - id, user_id, current, best, grace_used, last_active
- `badges` - id, user_id, badge_id, unlocked_at
- `settings` - id, user_id, reminder_time, timezone, theme, accent_color, daily_goal, focus_mins, notification flags
- `push_subscriptions` - id, user_id, endpoint, p256dh, auth
- `notification_log` - id, user_id, task_id, type, sent_at

---

## Edge functions

| Function | Trigger | Purpose |
|---|---|---|
| `complete-task` | HTTP POST | Awards XP, updates streak, checks badges |
| `streak-cron` | pg_cron daily | Resets streaks for inactive users |
| `send-push` | HTTP POST | Sends a push notification to a specific user |
| `daily-reminder` | pg_cron every minute | Fires morning reminder at each user's timezone |
| `due-date-warning` | pg_cron every minute | Warns users at 24h, 1h, and 20min before due date |
| `weekly-pride` | pg_cron Saturday 18:00 UTC | Sends HTML email + push with weekly summary |

---

## Design system

- Background: `#000000` (dark) / `#FFFFFF` (light)
- Primary accent: Electric Purple `#6C63FF`
- Body font: DM Sans
- Heading font: Syne
- Logo: Split tone wordmark — "Nu" in `#6C63FF`, "dge" in `#F5F5F5`
- All colors adapt to theme via CSS variables

---

## Local setup

```bash
git clone https://github.com/John-ayo/Nudge.git
cd Nudge
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then run:

```bash
npm run dev
```

---

## PWA

Nudge is installable as a Progressive Web App on Android, desktop (Chrome/Edge), and iOS (via Add to Home Screen on Safari, requires iOS 16.4+).

---

## Roadmap

- AI task assistant via Claude API (server-side edge function)
- Collaborative tasks
- Mobile app (React Native)

---

## License

MIT