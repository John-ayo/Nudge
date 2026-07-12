import { supabase } from "./supabase";

// Get streak row for a user
export async function getStreak(userId) {
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Update streak manually (used if needed outside edge functions)
export async function updateStreak(userId, updates) {
  const { data, error } = await supabase
    .from("streaks")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}