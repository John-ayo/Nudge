import { supabase } from "./supabase";

// Get total XP for a user (sum of all xp_log entries)
export async function getTotalXP(userId) {
  const { data, error } = await supabase
    .from("xp_log")
    .select("amount")
    .eq("user_id", userId);

  if (error) throw error;
  return data.reduce((sum, row) => sum + (row.amount ?? 0), 0);
}

// Get today's XP only
export async function getTodayXP(userId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("xp_log")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", todayStart.toISOString());

  if (error) throw error;
  return data.reduce((sum, row) => sum + (row.amount ?? 0), 0);
}

// Get full XP log history (for profile/stats page)
export async function getXPLog(userId) {
  const { data, error } = await supabase
    .from("xp_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}