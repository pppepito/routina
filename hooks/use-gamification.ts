"use client"

import { useState, useEffect } from "react"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  progress: number
  maxProgress: number
  category: "streak" | "completion" | "consistency" | "milestone"
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: Date
}

export interface GamificationData {
  level: number
  xp: number
  xpToNextLevel: number
  achievements: Achievement[]
  badges: Badge[]
  streakRecord: number
  totalCompletions: number
}

const defaultAchievements: Achievement[] = [
  {
    id: "first-habit",
    title: "Premier pas",
    description: "Créer votre première habitude",
    icon: "🎯",
    progress: 0,
    maxProgress: 1,
    category: "milestone",
  },
  {
    id: "week-streak",
    title: "Une semaine",
    description: "Maintenir une série de 7 jours",
    icon: "🔥",
    progress: 0,
    maxProgress: 7,
    category: "streak",
  },
  {
    id: "month-streak",
    title: "Un mois",
    description: "Maintenir une série de 30 jours",
    icon: "💪",
    progress: 0,
    maxProgress: 30,
    category: "streak",
  },
  {
    id: "hundred-completions",
    title: "Centenaire",
    description: "Compléter 100 habitudes",
    icon: "💯",
    progress: 0,
    maxProgress: 100,
    category: "completion",
  },
]

export function useGamification() {
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    achievements: defaultAchievements,
    badges: [],
    streakRecord: 0,
    totalCompletions: 0,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gamification")
      if (saved) {
        const parsed = JSON.parse(saved)
        setGamificationData({
          ...parsed,
          achievements: parsed.achievements.map((achievement: any) => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
          })),
          badges: parsed.badges.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt),
          })),
        })
      }
    } catch (error) {
      console.error("Error loading gamification data:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("gamification", JSON.stringify(gamificationData))
    } catch (error) {
      console.error("Error saving gamification data:", error)
    }
  }, [gamificationData])

  const addXP = (amount: number) => {
    setGamificationData((prev) => {
      const newXP = prev.xp + amount
      const newLevel = Math.floor(newXP / 100) + 1
      const xpToNextLevel = newLevel * 100 - newXP

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpToNextLevel,
      }
    })
  }

  const unlockAchievement = (achievementId: string) => {
    setGamificationData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((achievement) =>
        achievement.id === achievementId
          ? { ...achievement, unlockedAt: new Date(), progress: achievement.maxProgress }
          : achievement,
      ),
    }))
  }

  const updateAchievementProgress = (achievementId: string, progress: number) => {
    setGamificationData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((achievement) =>
        achievement.id === achievementId
          ? { ...achievement, progress: Math.min(progress, achievement.maxProgress) }
          : achievement,
      ),
    }))
  }

  const earnBadge = (badge: Omit<Badge, "earnedAt">) => {
    setGamificationData((prev) => ({
      ...prev,
      badges: [...prev.badges, { ...badge, earnedAt: new Date() }],
    }))
  }

  return {
    gamificationData,
    addXP,
    unlockAchievement,
    updateAchievementProgress,
    earnBadge,
  }
}
