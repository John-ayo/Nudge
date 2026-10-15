# Nudge

> The productivity app that celebrates you.

**Live demo:** [nudge.com.ng](https://nudge.com.ng)

![Dashboard](docs/screenshots/dashboard.png)

Nudge is a web-first task management app for students, professionals, and anyone who wants to feel motivated when finishing tasks. It combines XP, streaks, badges, push notifications, and GitHub activity to make productivity feel rewarding.

---

## Features

- Create and manage tasks with priority levels, due dates, estimated time, and categories
- Earn XP and level up as you complete tasks
- Build daily streaks, with streak protection (1 grace day per week)
- Unlock 7 badges for milestones (first task, 7-day streak, 100 tasks, and more)
- Focus timer linked to your tasks, with celebration sounds
- Connect GitHub and earn 30 XP for each pull request you merge in a public repository, up to 3 a day
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
  |-- Auth (email/password, Google OAuth, GitHub account linking)
  |-- Postgres + Row Level Security
  |-- Storage (avatars)
  |-- Edge Functions (Deno)
  |     complete-task, send-push, welcome-email, delete-account
  |     daily-reminder, due-date-warning, weekly-pride
  |     github-link, github-sync
  '-- pg_cron (triggers scheduled jobs)
Resend (transactional email)
Web Push + VAPID (browser push)
GitHub REST API (merged pull request search, public data only)
```

---

## GitHub integration

Users link their GitHub account from Settings. Nudge then polls GitHub for pull requests they have merged and awards XP.

```
User links GitHub (Supabase OAuth identity linking)
        |
github-link (Edge Function)
        |-- reads the username from the verified OAuth identity
        '-- saves it to github_links
        |
pg_cron (hourly) -> github-sync (Edge Function)
        |-- searches merged PRs per linked user (GitHub search API)
        |-- inserts new PRs into github_prs (unique per user and PR, so no double XP)
        '-- awards XP through xp_log (30 XP, max 3 PRs a day)
```

Rules and safeguards:

- Only pull requests in public repositories are counted. Commits never award XP, because they are too easy to fake.
- Only PRs merged after the account was linked count, so linking cannot backfill XP.
- The GitHub username comes from the verified OAuth identity on the server. Users cannot type in someone else's username.
- One GitHub account can be linked to one Nudge account.
- The GitHub tables are read-only for users through Row Level Security. Only Edge Functions write to them.
- `github-sync` accepts the service role key only.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (email/password, Google OAuth, GitHub account linking) |
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
| `github-link` | HTTP POST (signed-in user) | Saves the verified GitHub username for the caller |
| `github-sync` | pg_cron, hourly (service role key only) | Finds newly merged public PRs and awards XP |

## Scheduled jobs

| Job | Schedule | Purpose |
|---|---|---|
| Streak reset | pg_cron, daily | Resets streaks for inactive users |

Push delivery uses a shared helper (`supabase/functions/_shared/push.ts`) that sets a TTL and urgency per message type and removes expired subscriptions when the push service returns 404 or 410.

---

## Database

12 tables in the `public` schema, all protected by Row Level Security:

- `users`: id, email, name, avatar_url, created_at
- `tasks`: id, user_id, title, priority, done, due_date, est, cat, category_id, created_at, updated_at
- `categories`: id, user_id, name, icon, color, created_at
- `xp_log`: id, user_id, task_id, amount, reason, created_at
- `streaks`: id, user_id, current, best, grace_used, last_active
- `badges`: id, user_id, badge_id, unlocked_at
- `settings`: id, user_id, reminder_time, timezone, theme, accent_color, daily_goal, focus_mins, notification flags
- `push_subscriptions`: id, user_id, endpoint, p256dh, auth
- `notification_log`: id, user_id, task_id, type, sent_at
- `github_links`: user_id, username, linked_at
- `github_prs`: id, user_id, pr_id, repo, title, merged_at, xp_awarded
- `monthly_reports`: id, user_id, month, stats, emailed_at (reserved for the planned monthly report)

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
| `/settings` | Settings (includes GitHub connection) |
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

The app runs with just these two variables, but push notifications, emails, and GitHub XP need the backend below.

### Backend (optional, for push, email, and GitHub)

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Generate a VAPID key pair for Web Push.
3. Set the Edge Function secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `RESEND_API_KEY`, and `GH_API_TOKEN`.
4. For the GitHub integration, create a GitHub OAuth app with the Supabase callback URL, add its Client ID and Secret in the Supabase GitHub provider, turn on manual identity linking, and add your site's `/settings` URL to the allowed redirect URLs.
5. `GH_API_TOKEN` is a GitHub personal access token with no permissions. It only raises the API rate limit for public data.
6. Deploy the functions:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy daily-reminder
npx supabase functions deploy due-date-warning
npx supabase functions deploy weekly-pride
npx supabase functions deploy github-link
npx supabase functions deploy github-sync
```

Repeat the deploy command for each function you need. Then schedule the cron jobs in the Supabase dashboard using the schedules in the tables above.

---

## Roadmap

- Monthly report with total streak run, active days, PRs merged, and commits, delivered by email and as a shareable card
- Recurring tasks, with per-task reminders
- AI task breakdown through the Claude API (server-side Edge Function)
- Google Calendar import

---

## License

MIT