import posthog from "posthog-js";

// ─── User Identity ────────────────────────────────────────────────────────────
export function identifyUser(userId, traits = {}) {
  posthog.identify(userId, traits);
}

export function resetUser() {
  posthog.reset();
}

// ─── Task Events ──────────────────────────────────────────────────────────────
export function trackTaskCreated({ priority, has_category, has_due_date, est }) {
  posthog.capture("task_created", { priority, has_category, has_due_date, est });
}

export function trackTaskCompleted({ task_id, priority, xp_awarded, new_streak }) {
  posthog.capture("task_completed", { task_id, priority, xp_awarded, new_streak });
}

export function trackTaskDeleted({ task_id, priority }) {
  posthog.capture("task_deleted", { task_id, priority });
}

export function trackTaskEdited({ task_id, changed_fields }) {
  posthog.capture("task_edited", { task_id, changed_fields });
}

// ─── Affirmation Events ───────────────────────────────────────────────────────
export function trackAffirmationRefreshed({ category }) {
  posthog.capture("affirmation_refreshed", { category });
}

// ─── Celebration Events ───────────────────────────────────────────────────────
export function trackCelebrationDismissed({ xp, streak, page }) {
  posthog.capture("celebration_dismissed", { xp, streak, page });
}

// ─── Focus Events ─────────────────────────────────────────────────────────────
export function trackFocusSessionStarted({ task_id, est }) {
  posthog.capture("focus_session_started", { task_id, est });
}

// ─── Page Views ───────────────────────────────────────────────────────────────
export function trackPageViewed(page) {
  posthog.capture("page_viewed", { page });
}