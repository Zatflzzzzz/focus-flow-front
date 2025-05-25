export interface Habit {
  id: number;
  title: string;
  description: string;
  timeToComplete: string; // ISO time string
  dueDate: string; // ISO date string
  userId: number;
  lastAction: string; // ISO date string
  createdAt: string; // ISO date string
}
