"use client"

import { useState, useEffect } from "react"

export interface Goal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  category: "health" | "productivity" | "learning" | "personal" | "other"
  priority: "low" | "medium" | "high"
  isCompleted: boolean
  createdAt: string
  completedAt?: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  value: number
  isCompleted: boolean
  completedAt?: string
}

const STORAGE_KEY = "habit-tracker-goals"

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem(STORAGE_KEY)
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals))
      }
    } catch (error) {
      console.error("Error loading goals:", error)
    }
  }, [])

  const saveGoals = (newGoals: Goal[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals))
      setGoals(newGoals)
    } catch (error) {
      console.error("Error saving goals:", error)
    }
  }

  const addGoal = (goalData: Omit<Goal, "id" | "createdAt" | "isCompleted" | "currentValue">) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
      currentValue: 0,
    }
    saveGoals([...goals, newGoal])
  }

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    saveGoals(updatedGoals)
  }

  const deleteGoal = (id: string) => {
    const filteredGoals = goals.filter((goal) => goal.id !== id)
    saveGoals(filteredGoals)
  }

  const updateProgress = (id: string, newValue: number) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === id) {
        const isCompleted = newValue >= goal.targetValue
        return {
          ...goal,
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted && !goal.isCompleted ? new Date().toISOString() : goal.completedAt,
        }
      }
      return goal
    })
    saveGoals(updatedGoals)
  }

  const getGoalsByCategory = (category: Goal["category"]) => {
    return goals.filter((goal) => goal.category === category)
  }

  const getActiveGoals = () => {
    return goals.filter((goal) => !goal.isCompleted)
  }

  const getCompletedGoals = () => {
    return goals.filter((goal) => goal.isCompleted)
  }

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    getGoalsByCategory,
    getActiveGoals,
    getCompletedGoals,
    getGoalProgress,
  }
}
