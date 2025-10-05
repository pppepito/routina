"use client"

import { useState, useEffect } from "react"

export interface Reminder {
  id: string
  habitId: string
  time: string
  days: number[]
  message: string
  enabled: boolean
  createdAt: Date
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    try {
      const savedReminders = localStorage.getItem("reminders")
      if (savedReminders) {
        const parsed = JSON.parse(savedReminders)
        setReminders(
          parsed.map((reminder: any) => ({
            ...reminder,
            createdAt: new Date(reminder.createdAt),
          })),
        )
      }
    } catch (error) {
      console.error("Error loading reminders:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("reminders", JSON.stringify(reminders))
    } catch (error) {
      console.error("Error saving reminders:", error)
    }
  }, [reminders])

  const addReminder = (reminder: Omit<Reminder, "id" | "createdAt">) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setReminders((prev) => [...prev, newReminder])
  }

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, ...updates } : reminder)))
  }

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
  }

  const getRemindersForHabit = (habitId: string) => {
    return reminders.filter((reminder) => reminder.habitId === habitId)
  }

  return {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    getRemindersForHabit,
  }
}
