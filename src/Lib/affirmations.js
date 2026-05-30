export const AFFIRMATIONS = {
  morning: [
    "The day is blank. Write something worth reading.",
    "Small start, big finish. What's the first move?",
    "Morning means a new attempt. That's already something.",
    "You don't need to feel ready. Just begin.",
    "The version of you that finishes today is already waiting.",
  ],
  afternoon: [
    "Half the day is yours. Use it.",
    "Momentum is easier to keep than to rebuild. Keep going.",
    "One focused hour beats three distracted ones.",
    "Afternoon slump is real. Push through anyway.",
    "You're closer than you think.",
  ],
  evening: [
    "What you do in the evening sets tomorrow's mood.",
    "Even one task before sleep is a win.",
    "Rest is part of the work. You've earned it.",
    "Tonight's effort is tomorrow morning's head start.",
    "The day isn't over until you decide it is.",
  ],
  streak_building: [
    "Consistency is the most underrated skill. Keep stacking.",
    "Every day you show up is a vote for who you're becoming.",
    "The streak isn't the point. The habit is.",
    "You didn't break it. That means something.",
    "Showing up repeatedly is the whole game.",
  ],
  streak_milestone: [
    "That's a real streak. Not many people get here.",
    "Milestones like this don't happen by accident.",
    "You built this one day at a time. Don't stop.",
    "Most people quit before this point. You didn't.",
    "This is what discipline looks like from the inside.",
  ],
  crushing_it: [
    "You did what you said you'd do. That's rare.",
    "Today's you is provably better than yesterday's.",
    "Tasks done, energy earned. How does that feel?",
    "This is what a good day actually looks like.",
    "Closed out. Clean slate tomorrow.",
  ],
  no_tasks: [
    "Empty list, full potential. What's first?",
    "A blank slate is an invitation, not a void.",
    "Add one task. Just one. See what happens next.",
    "The hardest part is starting. So start small.",
    "Today's story hasn't been written yet.",
  ],
  monday: [
    "Monday again. You know what to do.",
    "The week is fresh. Set the tone early.",
    "Whatever last week was, this one is different.",
    "Monday isn't the enemy. Hesitation is.",
    "New week, same discipline. Let's go.",
  ],
  friday: [
    "Finish strong. The weekend means more when you earned it.",
    "Friday is proof you made it through another week.",
    "Close out what you started. The weekend's waiting.",
    "One more push. Then rest without guilt.",
    "What you finish today you won't carry into the weekend.",
  ],
  default: [
    "One task still counts. What can you do right now?",
    "Progress doesn't care about your mood. Show up anyway.",
    "You've done hard things before. This is just the next one.",
    "Focus is a choice you make every few minutes.",
    "The goal isn't perfect. The goal is done.",
  ],
};

// Priority: milestone > crushing_it > no_tasks > monday > friday > streak > time of day > default
export function pickAffirmation(context, exclude = null) {
  const { hour, dayOfWeek, streakCount, tasksDoneToday, tasksTotalToday } = context;

  let category = "default";

  if (streakCount > 0 && [7, 14, 21, 30, 60, 100].includes(streakCount)) {
    category = "streak_milestone";
  } else if (tasksTotalToday > 0 && tasksDoneToday === tasksTotalToday) {
    category = "crushing_it";
  } else if (tasksTotalToday === 0) {
    category = "no_tasks";
  } else if (dayOfWeek === 1) {
    category = "monday";
  } else if (dayOfWeek === 5) {
    category = "friday";
  } else if (streakCount >= 3) {
    category = "streak_building";
  } else if (hour < 12) {
    category = "morning";
  } else if (hour < 17) {
    category = "afternoon";
  } else {
    category = "evening";
  }

  const pool      = AFFIRMATIONS[category] ?? AFFIRMATIONS.default;
  const available = exclude ? pool.filter(m => m !== exclude) : pool;
  const source    = available.length > 0 ? available : pool;

  return {
    message: source[Math.floor(Math.random() * source.length)],
    category,
  };
}