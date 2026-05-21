import { supabase } from "./supabase";

// ─── Fetch settings for the current user ────────────────────────────────────
export async function fetchSettings(userId) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data ?? null;
}

// ─── Upsert settings row ─────────────────────────────────────────────────────
export async function updateSettings(userId, updates) {
  const { data, error } = await supabase
    .from("settings")
    .upsert(
      { user_id: userId, ...updates },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Update display name and/or email via Supabase Auth ─────────────────────
export async function updateProfile({ displayName, email }) {
  const updates = {};
  if (displayName) updates.data = { full_name: displayName };
  if (email)       updates.email = email;

  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) throw error;
  return data;
}

// ─── Change password ─────────────────────────────────────────────────────────
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// ─── Export tasks as CSV ──────────────────────────────────────────────────────
export async function exportTasksCSV(userId) {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("title, description, status, priority, due_date, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!tasks || tasks.length === 0) return null;

  const headers = ["Title", "Description", "Status", "Priority", "Due Date", "Created At"];
  const rows = tasks.map(t => [
    `"${(t.title       ?? "").replace(/"/g, '""')}"`,
    `"${(t.description ?? "").replace(/"/g, '""')}"`,
    t.status     ?? "",
    t.priority   ?? "",
    t.due_date   ?? "",
    t.created_at ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `nudge-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return tasks.length;
}

// ─── Clear all tasks for the current user ────────────────────────────────────
export async function clearAllTasks(userId) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

// ─── Delete account (auth user + cascade deletes all user data) ──────────────
// NOTE: This calls a Supabase Edge Function named "delete-account".
// Make sure RLS and cascades are set up so all user rows are removed.
export async function deleteAccount() {
  const { error } = await supabase.functions.invoke("delete-account");
  if (error) throw error;
  await supabase.auth.signOut();
}