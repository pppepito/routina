export type CompletionStatus = "completed" | "incomplete" | "failed"

export interface Habit {
  id: string
  name: string
  description?: string
  color: string
  frequency: "daily" | "weekly" | "custom"
  weeklyTarget: number
  targetDays?: number[]
  isActive: boolean
  createdAt: Date
}

export interface HabitCompletion {
  habitId: string
  date: string
  status: CompletionStatus
}

export interface HabitWithProgress extends Habit {
  completedToday: boolean
  streak: number
  completionRate: number
  currentWeekCompleted: number
}
