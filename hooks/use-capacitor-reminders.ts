"use client"

import { useState, useEffect } from "react"
import { CapacitorStorage } from "../lib/capacitor-storage"
import { NotificationManager } from "../lib/notifications"

export interface Reminder {
  id: string
  habitId: string
  time: string
  days: number[]
  message: string
  enabled: boolean
  createdAt: Date
}

export function useCapacitorReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      setIsLoading(true)
      const savedReminders = await CapacitorStorage.getItem("reminders")
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
    } finally {
      setIsLoading(false)
    }
  }

  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await CapacitorStorage.setItem("reminders", JSON.stringify(newReminders))
      setReminders(newReminders)
    } catch (error) {
      console.error("Error saving reminders:", error)
    }
  }

  const addReminder = async (reminder: Omit<Reminder, "id" | "createdAt">) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    const newReminders = [...reminders, newReminder]
    await saveReminders(newReminders)

    // Schedule notification if enabled
    if (newReminder.enabled) {
      await scheduleNotification(newReminder)
    }
  }

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    const newReminders = reminders.map((reminder) => (reminder.id === id ? { ...reminder, ...updates } : reminder))
    await saveReminders(newReminders)

    // Update notification
    const updatedReminder = newReminders.find((r) => r.id === id)
    if (updatedReminder) {
      await NotificationManager.cancelReminder(Number.parseInt(id))
      if (updatedReminder.enabled) {
        await scheduleNotification(updatedReminder)
      }
    }
  }

  const deleteReminder = async (id: string) => {
    const newReminders = reminders.filter((reminder) => reminder.id !== id)
    await saveReminders(newReminders)

    // Cancel notification
    await NotificationManager.cancelReminder(Number.parseInt(id))
  }

  const scheduleNotification = async (reminder: Reminder) => {
    // Request permissions first
    const hasPermission = await NotificationManager.requestPermissions()
    if (!hasPermission) {
      console.warn("Notification permissions not granted")
      return
    }

    // Parse time
    const [hours, minutes] = reminder.time.split(":").map(Number)

    // Schedule for each day
    for (const day of reminder.days) {
      const scheduleDate = new Date()
      scheduleDate.setHours(hours, minutes, 0, 0)

      // Adjust for the specific day of week
      const currentDay = scheduleDate.getDay()
      const daysUntilTarget = (day - currentDay + 7) % 7
      scheduleDate.setDate(scheduleDate.getDate() + daysUntilTarget)

      // If the time has passed today, schedule for next week
      if (daysUntilTarget === 0 && scheduleDate < new Date()) {
        scheduleDate.setDate(scheduleDate.getDate() + 7)
      }

      await NotificationManager.scheduleReminder(
        Number.parseInt(reminder.id) + day, // Unique ID for each day
        "Rappel d'habitude",
        reminder.message || "Il est temps pour votre habitude !",
        scheduleDate,
      )
    }
  }

  const getRemindersForHabit = (habitId: string) => {
    return reminders.filter((reminder) => reminder.habitId === habitId)
  }

  return {
    reminders,
    isLoading,
    addReminder,
    updateReminder,
    deleteReminder,
    getRemindersForHabit,
  }
}
