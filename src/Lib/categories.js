import { supabase } from "./supabase";

const DEFAULT_CATEGORIES = [
  { name: "Work",     icon: "Briefcase", color: "#6C63FF" },
  { name: "Study",    icon: "BookOpen",  color: "#10B981" },
  { name: "Health",   icon: "Heart",     color: "#F59E0B" },
  { name: "Personal", icon: "User",      color: "#EF4444" },
];

export async function fetchCategories(userId) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Seed defaults if user has no categories yet
  if (data.length === 0) {
    return await seedDefaultCategories(userId);
  }

  return data;
}

async function seedDefaultCategories(userId) {
  const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
  const { data, error } = await supabase
    .from("categories")
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
}

export async function createCategory(userId, { name, icon, color }) {
  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: userId, name, icon, color })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id, { name, icon, color }) {
  const { data, error } = await supabase
    .from("categories")
    .update({ name, icon, color })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}