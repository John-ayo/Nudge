import { supabase } from "./supabase";

export const BADGES = {
  first_blood: {
    key: "first_blood",
    name: "First Blood",
    description: "You completed your very first task. Every legend has a beginning.",
    category: "Milestone",
  },
  on_a_roll: {
    key: "on_a_roll",
    name: "On a Roll",
    description: "7 days straight. You showed up when it would have been easier not to.",
    category: "Streak",
  },
  unstoppable: {
    key: "unstoppable",
    name: "Unstoppable",
    description: "30 consecutive days. That's not luck. That's a lifestyle.",
    category: "Streak",
  },
  century: {
    key: "century",
    name: "Century",
    description: "100 tasks completed. Volume beats inspiration every time.",
    category: "Milestone",
  },
  xp_hunter: {
    key: "xp_hunter",
    name: "XP Hunter",
    description: "You earned 1,000 XP. The grind is showing.",
    category: "XP",
  },
  speed_demon: {
    key: "speed_demon",
    name: "Speed Demon",
    description: "5 tasks in a single day. You were locked in.",
    category: "Productivity",
  },
  centurion: {
    key: "centurion",
    name: "Centurion",
    description: "Level 10 reached. You didn't just use Nudge. You mastered it.",
    category: "XP",
  },
};

export const BADGE_LIST = Object.values(BADGES);

export async function fetchUserBadges(userId) {
  const { data, error } = await supabase
    .from("badges")
    .select("badge_id, unlocked_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}