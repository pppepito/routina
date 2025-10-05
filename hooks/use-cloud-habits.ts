"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"
import type { Habit, HabitCompletion } from "../types/habit"
import { useAuth } from "./use-auth"

export function useCloudHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const { user } = useAuth()

  // Synchronisation avec Supabase
  const syncWithCloud = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Charger les habitudes
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (habitsError) throw habitsError

      // Charger les complétions
      const { data: completionsData, error: completionsError } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id)

      if (completionsError) throw completionsError

      // Convertir les données
      const convertedHabits: Habit[] = habitsData.map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        color: h.color,
        icon: h.icon,
        targetDays: h.target_days,
        weeklyTarget: h.weekly_target,
        createdAt: new Date(h.created_at),
      }))

      const convertedCompletions: HabitCompletion[] = completionsData.map((c) => ({
        habitId: c.habit_id,
        date: c.date,
        status: c.status as any,
      }))

      setHabits(convertedHabits)
      setCompletions(convertedCompletions)
      setIsOnline(true)
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
      setIsOnline(false)
      // Charger depuis le cache local en cas d'erreur
      loadFromLocalCache()
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Charger depuis le cache local
  const loadFromLocalCache = () => {
    try {
      const cachedHabits = localStorage.getItem("habits")
      const cachedCompletions = localStorage.getItem("completions")

      if (cachedHabits) {
        const parsed = JSON.parse(cachedHabits)
        setHabits(
          parsed.map((h: any) => ({
            ...h,
            createdAt: new Date(h.createdAt),
          })),
        )
      }

      if (cachedCompletions) {
        setCompletions(JSON.parse(cachedCompletions))
      }
    } catch (error) {
      console.error("Erreur de chargement du cache:", error)
    }
  }

  // Sauvegarder localement ET dans le cloud
  const saveHabit = async (habit: Habit) => {
    if (!user) return

    try {
      // Sauvegarder localement d'abord
      const newHabits = [...habits, habit]
      setHabits(newHabits)
      localStorage.setItem("habits", JSON.stringify(newHabits))

      // Puis dans le cloud
      const { error } = await supabase.from("habits").insert({
        id: habit.id,
        user_id: user.id,
        title: habit.title,
        description: habit.description,
        color: habit.color,
        icon: habit.icon,
        target_days: habit.targetDays,
        weekly_target: habit.weeklyTarget,
      })

      if (error) throw error
      setIsOnline(true)
    } catch (error) {
      console.error("Erreur de sauvegarde:", error)
      setIsOnline(false)
      // Les données sont déjà sauvées localement
    }
  }

  // Initialisation
  useEffect(() => {
    if (user) {
      syncWithCloud()
    } else {
      loadFromLocalCache()
      setIsLoading(false)
    }
  }, [user, syncWithCloud])

  // Synchronisation périodique
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncWithCloud()
      }
    }, 30000) // Sync toutes les 30 secondes

    return () => clearInterval(interval)
  }, [user, syncWithCloud])

  return {
    habits,
    completions,
    isLoading,
    isOnline,
    saveHabit,
    syncWithCloud,
  }
}
