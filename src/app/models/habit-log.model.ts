export interface HabitLog {
  id: number;
  scheduledDate: string; // ISO date string
  completed: boolean;
  habitId: number;
}
