"use client"

import { useState, useEffect, useCallback } from "react"
import type { Habit, HabitCompletion, HabitWithProgress, CompletionStatus } from "../types/habit"
import { CapacitorStorage } from "../lib/capacitor-storage"
import { NotificationManager } from "../lib/notifications"
import { HapticsManager } from "../lib/haptics"

// Create a unique EventTarget to broadcast changes across components
const habitEventTarget = new EventTarget()
const HABIT_STORAGE_EVENT = "habit-storage-change"

// Helper function to dispatch the custom event
const dispatchStorageChangeEvent = () => {
  habitEventTarget.dispatchEvent(new Event(HABIT_STORAGE_EVENT))
}

export function useCapacitorHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [celebratingHabits, setCelebratingHabits] = useState<Set<string>>(new Set())
  const [weekOffset, setWeekOffset] = useState(0)

  // Function to load data from Capacitor storage
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [savedHabits, savedCompletions] = await Promise.all([
        CapacitorStorage.getItem("habits"),
        CapacitorStorage.getItem("completions"),
      ])

      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits)
        const habitsWithDates = parsedHabits.map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt),
        }))
        setHabits(habitsWithDates)
      } else {
        setHabits([])
      }

      if (savedCompletions) {
        const parsedCompletions = JSON.parse(savedCompletions)
        setCompletions(parsedCompletions)
      } else {
        setCompletions([])
      }
    } catch (error) {
      console.error("Error loading data from storage:", error)
      setHabits([])
      setCompletions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect for initial data load and subscribing to sync events
  useEffect(() => {
    loadData()

    const handleStorageChange = () => {
      loadData()
    }

    // Listen for the custom event to re-load data
    habitEventTarget.addEventListener(HABIT_STORAGE_EVENT, handleStorageChange)

    // Créer une sauvegarde automatique au démarrage
    CapacitorStorage.createAutoBackup()

    // Nettoyer les anciennes sauvegardes
    CapacitorStorage.cleanOldAutoBackups()

    // Cleanup listener on component unmount
    return () => {
      habitEventTarget.removeEventListener(HABIT_STORAGE_EVENT, handleStorageChange)
    }
  }, [loadData])

  // Sauvegarde automatique périodique
  useEffect(() => {
    const interval = setInterval(
      () => {
        CapacitorStorage.createAutoBackup()
        CapacitorStorage.cleanOldAutoBackups()
      },
      24 * 60 * 60 * 1000,
    ) // Une fois par jour

    return () => clearInterval(interval)
  }, [])

  // --- Modifier Functions ---
  const addHabit = useCallback(async (habit: Omit<Habit, "id" | "createdAt">) => {
    try {
      const currentHabitsStr = await CapacitorStorage.getItem("habits")
      const currentHabits = currentHabitsStr ? JSON.parse(currentHabitsStr) : []

      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date(),
      }

      const newHabits = [...currentHabits, newHabit]
      await CapacitorStorage.setItem("habits", JSON.stringify(newHabits))

      // Trigger haptic feedback
      await HapticsManager.success()

      dispatchStorageChangeEvent()
    } catch (error) {
      console.error("Error adding habit:", error)
      await HapticsManager.error()
    }
  }, [])

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    try {
      const currentHabitsStr = await CapacitorStorage.getItem("habits")
      const currentHabits = currentHabitsStr ? JSON.parse(currentHabitsStr) : []

      const newHabits = currentHabits.map((h: Habit) => (h.id === id ? { ...h, ...updates } : h))
      await CapacitorStorage.setItem("habits", JSON.stringify(newHabits))

      await HapticsManager.impact("light")
      dispatchStorageChangeEvent()
    } catch (error) {
      console.error("Error updating habit:", error)
      await HapticsManager.error()
    }
  }, [])

  const deleteHabit = useCallback(async (id: string) => {
    try {
      const [currentHabitsStr, currentCompletionsStr] = await Promise.all([
        CapacitorStorage.getItem("habits"),
        CapacitorStorage.getItem("completions"),
      ])

      const currentHabits = currentHabitsStr ? JSON.parse(currentHabitsStr) : []
      const currentCompletions = currentCompletionsStr ? JSON.parse(currentCompletionsStr) : []

      const newHabits = currentHabits.filter((h: Habit) => h.id !== id)
      const newCompletions = currentCompletions.filter((c: HabitCompletion) => c.habitId !== id)

      await Promise.all([
        CapacitorStorage.setItem("habits", JSON.stringify(newHabits)),
        CapacitorStorage.setItem("completions", JSON.stringify(newCompletions)),
      ])

      // Cancel any notifications for this habit
      await NotificationManager.cancelReminder(Number.parseInt(id))

      await HapticsManager.impact("medium")
      dispatchStorageChangeEvent()
    } catch (error) {
      console.error("Error deleting habit:", error)
      await HapticsManager.error()
    }
  }, [])

  const toggleHabitCompletion = useCallback(async (habitId: string, date: string) => {
    try {
      const currentCompletionsStr = await CapacitorStorage.getItem("completions")
      const currentCompletions = currentCompletionsStr ? JSON.parse(currentCompletionsStr) : []

      const existingIndex = currentCompletions.findIndex(
        (c: HabitCompletion) => c.habitId === habitId && c.date === date,
      )

      if (existingIndex > -1) {
        const existing = currentCompletions[existingIndex]
        let newStatus: CompletionStatus
        switch (existing.status) {
          case "incomplete":
            newStatus = "completed"
            await HapticsManager.success()
            break
          case "completed":
            newStatus = "incomplete"
            await HapticsManager.impact("light")
            break
          case "failed":
            newStatus = "incomplete"
            await HapticsManager.impact("light")
            break
          default:
            newStatus = "completed"
            await HapticsManager.success()
        }
        currentCompletions[existingIndex] = { ...existing, status: newStatus }
      } else {
        currentCompletions.push({ habitId, date, status: "completed" })
        await HapticsManager.success()
      }

      await CapacitorStorage.setItem("completions", JSON.stringify(currentCompletions))
      dispatchStorageChangeEvent()
    } catch (error) {
      console.error("Error toggling habit completion:", error)
      await HapticsManager.error()
    }
  }, [])

  // --- Read-only Functions ---
  const getHabitCompletion = useCallback(
    (habitId: string, date: string): CompletionStatus => {
      const completion = completions.find((c) => c.habitId === habitId && c.date === date)
      return completion?.status || "incomplete"
    },
    [completions],
  )

  const isHabitScheduledForDay = useCallback((habit: Habit, date: Date): boolean => {
    const dayOfWeek = date.getDay()
    return habit.targetDays && habit.targetDays.length > 0 ? habit.targetDays.includes(dayOfWeek) : false
  }, [])

  const calculateStreak = useCallback(
    (habitId: string): number => {
      const today = new Date()
      let streak = 0
      const currentDate = new Date(today)
      let foundGap = false

      for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split("T")[0]
        const status = getHabitCompletion(habitId, dateStr)

        if (status === "completed") {
          if (!foundGap) {
            streak++
          } else {
            break
          }
        } else if (status === "failed") {
          break
        } else if (status === "incomplete") {
          const isToday = currentDate.toDateString() === today.toDateString()
          const isFuture = currentDate > today

          if (!isToday && !isFuture) {
            foundGap = true
          }
        }
        currentDate.setDate(currentDate.getDate() - 1)
      }
      return streak
    },
    [getHabitCompletion],
  )

  const getHabitsWithProgress = useCallback((): HabitWithProgress[] => {
    const today = new Date().toISOString().split("T")[0]
    return habits.map((habit) => {
      const completedToday = getHabitCompletion(habit.id, today) === "completed"
      const streak = calculateStreak(habit.id)
      let completedDays = 0
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split("T")[0]
        if (getHabitCompletion(habit.id, dateStr) === "completed") {
          completedDays++
        }
      }
      const completionRate = Math.round((completedDays / 7) * 100)
      const getCurrentWeekDates = () => {
        const today = new Date()
        const currentDay = today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))
        const weekDates = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          weekDates.push(date)
        }
        return weekDates
      }
      const weekDates = getCurrentWeekDates()
      const currentWeekCompleted = weekDates.filter((date) => {
        const dateStr = date.toISOString().split("T")[0]
        return getHabitCompletion(habit.id, dateStr) === "completed"
      }).length
      return {
        ...habit,
        completedToday,
        streak,
        completionRate,
        currentWeekCompleted,
      }
    })
  }, [habits, getHabitCompletion, calculateStreak])

  return {
    habits,
    completions,
    isLoading,
    getHabitsWithProgress,
    toggleHabitCompletion,
    getHabitCompletion,
    isHabitScheduledForDay,
    addHabit,
    updateHabit,
    deleteHabit,
    celebratingHabits,
    weekOffset,
    setWeekOffset,
  }
}
