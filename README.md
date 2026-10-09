# Nudge

> The productivity app that celebrates you.

**Live demo:** [nudge.com.ng](https://nudge.com.ng)

![Dashboard](docs/screenshots/dashboard.png)

Nudge is a web-first task management app for students, professionals, and anyone who wants to feel motivated when finishing tasks. It combines XP, streaks, badges, and push notifications to make productivity feel rewarding.

---

## Features

- Create and manage tasks with priority levels, due dates, estimated time, and categories
- Earn XP and level up as you complete tasks
- Build daily streaks, with streak protection (1 grace day per week)
- Unlock 7 badges for milestones (first task, 7-day streak, 100 tasks, and more)
- Focus timer linked to your tasks, with celebration sounds
- Push notifications: a daily morning reminder, due date warnings at 24h, 1h, and 20min, and a weekly pride report every Saturday
- Weekly pride email summarising tasks done, XP earned, streak, and badges unlocked
- Dark and light mode with a theme-aware UI
- Installable as a PWA on Android, desktop, and iOS (via Add to Home Screen, iOS 16.4+)

![Tasks](docs/screenshots/tasks.png)

---

## Architecture

```
React 18 PWA (Vite, Tailwind, Vercel)
  |-- Service Worker (push events, notification clicks)
  |-- PostHog (analytics)
  v
Supabase
  |-- Auth (email/password, Google OAuth)
  |-- Postgres + Row Level Security
  |-- Storage (avatars)
  |-- Edge Functions (Deno)
  |     complete-task, send-push, welcome-email, delete-account
  |     daily-reminder, due-date-warning, weekly-pride
  '-- pg_cron (triggers scheduled jobs)
Resend (transactional email)
Web Push + VAPID (browser push)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (email/password, Google OAuth) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Email | Resend |
| Push Notifications | Web Push API with VAPID |
| Analytics | PostHog |
| Icons | Lucide React |
| Fonts | DM Sans (body), Syne (headings) |

---

## Edge functions

| Function | Trigger | Purpose |
|---|---|---|
| `complete-task` | HTTP POST | Awards XP, updates the streak, checks badges |
| `send-push` | Internal (service role key only) | Sends a push notification to one user |
| `daily-reminder` | pg_cron, every minute | Sends the morning reminder at each user's local time |
| `due-date-warning` | pg_cron, every minute | Warns users 24h, 1h, and 20min before a due date |
| `weekly-pride` | pg_cron, Saturday 18:00 UTC | Sends the weekly HTML email and a push |
| `welcome-email` | Database trigger | Sends the welcome email on signup |
| `delete-account` | HTTP POST | Deletes a user's account and data |

## Scheduled jobs

| Job | Schedule | Purpose |
|---|---|---|
| Streak reset | pg_cron, daily | Resets streaks for inactive users |

Push delivery uses a shared helper (`supabase/functions/_shared/push.ts`) that sets a TTL and urgency per message type and removes expired subscriptions when the push service returns 404 or 410.

---

## Database

9 tables in the `public` schema, all protected by Row Level Security:

- `users`: id, email, name, avatar_url, created_at
- `tasks`: id, user_id, title, priority, done, due_date, est, cat, category_id, created_at, updated_at
- `categories`: id, user_id, name, icon, color, created_at
- `xp_log`: id, user_id, task_id, amount, reason, created_at
- `streaks`: id, user_id, current, best, grace_used, last_active
- `badges`: id, user_id, badge_id, unlocked_at
- `settings`: id, user_id, reminder_time, timezone, theme, accent_color, daily_goal, focus_mins, notification flags
- `push_subscriptions`: id, user_id, endpoint, p256dh, auth
- `notification_log`: id, user_id, task_id, type, sent_at

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing page |
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

## Design system

- Background: `#000000` (dark), `#FFFFFF` (light)
- Primary accent: Electric Purple `#6C63FF`
- Body font: DM Sans
- Heading font: Syne
- Logo: split tone wordmark, "Nu" in `#6C63FF` and "dge" in `#F5F5F5`
- All colors adapt to the theme through CSS variables

---

## Local setup

### Frontend

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

The app runs with just these two variables, but push notifications and emails need the backend below.

### Backend (optional, for push and email)

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Generate a VAPID key pair for Web Push.
3. Set the Edge Function secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `RESEND_API_KEY`.
4. Deploy the functions:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy daily-reminder
npx supabase functions deploy due-date-warning
npx supabase functions deploy weekly-pride
```

Repeat the deploy command for each function you need. Then schedule the cron jobs in the Supabase dashboard using the schedules in the table above.

---

## Roadmap

- Recurring tasks, with per-task reminders
- AI task breakdown through the Claude API (server-side Edge Function)
- Google Calendar import

---

## License

MIT