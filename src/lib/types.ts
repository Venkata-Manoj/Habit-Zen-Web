export type Habit = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  reminderTime?: string | null;
};

export type HabitCompletion = {
  habitId: string;
  date: string; // YYYY-MM-DD
};
