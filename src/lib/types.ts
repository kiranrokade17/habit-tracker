export type Habit = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  active: boolean;
};

export type HabitEntry = {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
};

export type DailyScore = {
  date: string;
  total_completed: number;
  total_habits: number;
  percentage: number;
};
