"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Star,
  Target,
  Flame,
  Award,
  Gift,
  Zap,
  Crown,
  Medal,
  Sparkles,
  TrendingUp,
  Calendar,
  CheckCircle,
} from "lucide-react"
import { useHabits } from "../hooks/use-habits"
import { useGamification } from "../hooks/use-gamification"

export function GamificationHub() {
  const { habits, completions } = useHabits()
  const { level, xp, totalXpEarned, badges, achievements, streakRecord } = useGamification()
  const [activeTab, setActiveTab] = useState("overview")

  // Calculer les statistiques
  const totalHabits = habits.length
  const completedToday = habits.filter((habit) => {
    const today = new Date().toISOString().split("T")[0]
    return completions.some((c) => c.habitId === habit.id && c.date === today && c.status === "completed")
  }).length

  const totalCompletions = completions.filter((c) => c.status === "completed").length
  const currentStreak = Math.max(
    ...habits.map((habit) => {
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        const completion = completions.find((c) => c.habitId === habit.id && c.date === dateStr)
        if (completion?.status === "completed") {
          streak++
        } else {
          break
        }
      }
      return streak
    }),
    0,
  )

  // Calculer les badges disponibles
  const availableBadges = [
    {
      id: "first_habit",
      name: "Premier pas",
      description: "Créer votre première habitude",
      icon: "🎯",
      unlocked: totalHabits > 0,
      category: "Débutant",
    },
    {
      id: "week_streak",
      name: "Une semaine",
      description: "Maintenir une série de 7 jours",
      icon: "🔥",
      unlocked: currentStreak >= 7,
      category: "Série",
    },
    {
      id: "month_streak",
      name: "Un mois",
      description: "Maintenir une série de 30 jours",
      icon: "🏆",
      unlocked: currentStreak >= 30,
      category: "Série",
    },
    {
      id: "fifty_completions",
      name: "Persévérant",
      description: "Compléter 50 habitudes",
      icon: "💪",
      unlocked: totalCompletions >= 50,
      category: "Accomplissement",
    },
    {
      id: "hundred_completions",
      name: "Centenaire",
      description: "Compléter 100 habitudes",
      icon: "💯",
      unlocked: totalCompletions >= 100,
      category: "Accomplissement",
    },
    {
      id: "five_habits",
      name: "Collectionneur",
      description: "Créer 5 habitudes différentes",
      icon: "📚",
      unlocked: totalHabits >= 5,
      category: "Collection",
    },
    {
      id: "perfect_week",
      name: "Semaine parfaite",
      description: "Compléter toutes les habitudes pendant 7 jours",
      icon: "⭐",
      unlocked: false, // À implémenter
      category: "Perfection",
    },
    {
      id: "early_bird",
      name: "Lève-tôt",
      description: "Compléter des habitudes avant 8h",
      icon: "🌅",
      unlocked: false, // À implémenter
      category: "Timing",
    },
  ]

  const unlockedBadges = availableBadges.filter((badge) => badge.unlocked)
  const lockedBadges = availableBadges.filter((badge) => !badge.unlocked)

  // Calculer le progrès vers le niveau suivant
  const xpForNextLevel = (level + 1) * 100
  const xpProgress = (xp / xpForNextLevel) * 100

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Niveau et XP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <span>Niveau {level}</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {xp} XP
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progrès vers le niveau {level + 1}</span>
              <span>
                {xp}/{xpForNextLevel} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Plus que {xpForNextLevel - xp} XP pour atteindre le niveau suivant !
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{unlockedBadges.length}</div>
            <div className="text-sm text-muted-foreground">Badges débloqués</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{streakRecord}</div>
            <div className="text-sm text-muted-foreground">Record de série</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <div className="text-sm text-muted-foreground">Total complétions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{completedToday}</div>
            <div className="text-sm text-muted-foreground">Aujourd'hui</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Derniers badges débloqués
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unlockedBadges.length > 0 ? (
            <div className="space-y-3">
              {unlockedBadges.slice(-3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-sm text-muted-foreground">{badge.description}</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Débloqué
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">Aucun badge débloqué pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">Commencez à créer des habitudes !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderBadges = () => (
    <div className="space-y-6">
      {/* Badges débloqués */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-yellow-500" />
            Badges débloqués ({unlockedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-800">{badge.name}</div>
                    <div className="text-sm text-yellow-700">{badge.description}</div>
                    <Badge variant="outline" className="mt-1 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                      {badge.category}
                    </Badge>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">Aucun badge débloqué</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges à débloquer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />À débloquer ({lockedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
              >
                <div className="text-3xl grayscale">{badge.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-600">{badge.name}</div>
                  <div className="text-sm text-gray-500">{badge.description}</div>
                  <Badge variant="outline" className="mt-1 text-xs bg-gray-100 text-gray-600 border-gray-300">
                    {badge.category}
                  </Badge>
                </div>
                <div className="text-gray-400">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Réalisations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Vos records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-green-800">{streakRecord}</div>
              <div className="text-sm text-green-600">Plus longue série</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-800">{totalCompletions}</div>
              <div className="text-sm text-blue-600">Total complétions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-800">{totalHabits}</div>
              <div className="text-sm text-purple-600">Habitudes créées</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-800">{level}</div>
              <div className="text-sm text-yellow-600">Niveau atteint</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Défis à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Prochains défis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentStreak < 7 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Série de 7 jours</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Plus que {7 - currentStreak} jour(s) pour débloquer le badge "Une semaine"
                </p>
                <Progress value={(currentStreak / 7) * 100} className="mt-2 h-2" />
              </div>
            )}
            {totalCompletions < 50 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">50 complétions</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Plus que {50 - totalCompletions} complétions pour le badge "Persévérant"
                </p>
                <Progress value={(totalCompletions / 50) * 100} className="mt-2 h-2" />
              </div>
            )}
            {totalHabits < 5 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">5 habitudes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Plus que {5 - totalHabits} habitude(s) pour le badge "Collectionneur"
                </p>
                <Progress value={(totalHabits / 5) * 100} className="mt-2 h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F2F2" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="font-bold text-[#8789C0] text-2xl">Gamification</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Niveau {level}
          </Badge>
          <Trophy className="h-6 w-6 text-[#8789C0]" />
        </div>
      </div>

      <div className="px-4 space-y-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="achievements">Records</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            {renderBadges()}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {renderAchievements()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
