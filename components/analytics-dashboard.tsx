"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, Target, BarChart3, Flame, Activity, Smile } from 'lucide-react'
import { useHabits } from "../hooks/use-habits"
import { useNotes } from "../hooks/use-notes"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { useTranslations } from "../hooks/use-translations"

export function AnalyticsDashboard() {
  const { t } = useTranslations()
  const { getHabitsWithProgress, getHabitCompletion, isHabitScheduledForDay, habits } = useHabits()
  const { notes } = useNotes()
  const habitsWithProgress = getHabitsWithProgress()

  const [selectedHabit, setSelectedHabit] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7")
  const [statusFilter, setStatusFilter] = useState<string>("success")

  // Filtrer les habitudes selon la sélection
  const filteredHabits =
    selectedHabit === "all" ? habitsWithProgress : habitsWithProgress.filter((habit) => habit.id === selectedHabit)

  // Calculer les statistiques pour la période sélectionnée
  const periodDays = Number.parseInt(selectedPeriod)

  // Calculer les dates de la période
  const getPeriodsDate = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - periodDays)

    return {
      startDate,
      endDate,
    }
  }

  const { startDate, endDate } = getPeriodsDate()

  // Filtrer les notes selon la période et l'habitude
  const filteredNotes = notes.filter((note) => {
    // Exclure les notes liées aux objectifs
    if (note.goalId) return false

    const noteDate = new Date(note.date)
    const isInPeriod = noteDate >= startDate && noteDate <= endDate

    // Si une habitude spécifique est sélectionnée, filtrer aussi par habitude
    if (selectedHabit !== "all") return isInPeriod && note.habitId === selectedHabit

    return isInPeriod
  })

  // Calculer les completions et objectifs pour la période
  const calculatePeriodStats = () => {
    let totalCompletions = 0
    let totalGoals = 0
    let totalFailed = 0
    let totalIncomplete = 0
    let maxStreak = 0

    filteredHabits.forEach((habit) => {
      let habitCompletions = 0
      let habitFailed = 0
      let habitIncomplete = 0
      let currentStreak = 0
      let habitMaxStreak = 0

      // Calculer les completions réelles sur la période (TOUTES les cases cochées)
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0]
        const completion = getHabitCompletion(habit.id, dateStr)
        const isScheduled = isHabitScheduledForDay(habit, d)

        // Compter TOUTES les completions, planifiées ou non
        if (completion === "completed") {
          habitCompletions++
          currentStreak++
          habitMaxStreak = Math.max(habitMaxStreak, currentStreak)
        } else if (completion === "failed") {
          habitFailed++
          currentStreak = 0
        } else if (isScheduled) {
          // Ne compter comme "incomplete" que si c'était planifié
          habitIncomplete++
        }
      }

      // L'objectif est basé sur le weeklyTarget de l'habitude
      // Pour une période de 7 jours ou moins, on utilise weeklyTarget
      // Pour une période plus longue, on calcule proportionnellement
      let habitGoal = habit.weeklyTarget
      if (periodDays > 7) {
        habitGoal = Math.round((habit.weeklyTarget * periodDays) / 7)
      }

      totalCompletions += habitCompletions
      totalFailed += habitFailed
      totalIncomplete += habitIncomplete
      totalGoals += habitGoal
      maxStreak = Math.max(maxStreak, habitMaxStreak)
    })

    return {
      totalCompletions,
      totalFailed,
      totalIncomplete,
      totalScheduled: totalGoals,
      maxStreak,
      averageCompletion: totalGoals > 0 ? Math.round((totalCompletions / totalGoals) * 100) : 0,
    }
  }

  const periodStats = calculatePeriodStats()

  // Calculer les statistiques des humeurs
  const calculateMoodStats = () => {
    const moodCounts = {
      great: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0,
    }

    filteredNotes.forEach((note) => {
      if (note.mood) {
        moodCounts[note.mood]++
      }
    })

    const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0)

    // Calculer l'humeur moyenne (1=terrible, 5=great)
    const moodValues = {
      terrible: 1,
      bad: 2,
      neutral: 3,
      good: 4,
      great: 5,
    }

    let weightedSum = 0
    Object.entries(moodCounts).forEach(([mood, count]) => {
      weightedSum += moodValues[mood as keyof typeof moodValues] * count
    })

    const averageMood = totalMoods > 0 ? weightedSum / totalMoods : 3

    // Convertir en emoji
    const getMoodEmoji = (avg: number) => {
      if (avg >= 4.5) return "😄"
      if (avg >= 3.5) return "😊"
      if (avg >= 2.5) return "😐"
      if (avg >= 1.5) return "😕"
      return "😞"
    }

    // Calculer le pourcentage d'humeurs positives (good + great)
    const positivePercentage =
      totalMoods > 0 ? Math.round(((moodCounts.good + moodCounts.great) / totalMoods) * 100) : 0

    return {
      totalMoods,
      averageMood,
      moodEmoji: getMoodEmoji(averageMood),
      moodCounts,
      positivePercentage,
    }
  }

  const moodStats = calculateMoodStats()

  // Générer les données pour le graphique d'évolution avec filtre
  const generateEvolutionData = () => {
    const data = []

    if (periodDays <= 30) {
      // Pour 7 jours et 1 mois : affichage par jour
      const daysToShow = Math.min(periodDays, 30)

      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        let dayCompletions = 0
        let dayFailed = 0
        let dayIncomplete = 0
        let dayGoals = 0

        filteredHabits.forEach((habit) => {
          const completion = getHabitCompletion(habit.id, dateStr)

          if (completion === "completed") {
            dayCompletions++
          } else if (completion === "failed") {
            dayFailed++
          }

          const dailyGoal = Math.ceil(habit.weeklyTarget / 7)
          dayGoals += dailyGoal

          const totalRealized = (completion === "completed" ? 1 : 0) + (completion === "failed" ? 1 : 0)
          if (totalRealized < dailyGoal) {
            dayIncomplete += dailyGoal - totalRealized
          }
        })

        const successPercentage = dayGoals > 0 ? Math.round((dayCompletions / dayGoals) * 100) : 0
        const failedPercentage = dayGoals > 0 ? Math.round((dayFailed / dayGoals) * 100) : 0
        const incompletePercentage = dayGoals > 0 ? Math.round((dayIncomplete / dayGoals) * 100) : 0

        data.push({
          date: date.getDate().toString(),
          fullDate: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
          successPercentage,
          failedPercentage,
          incompletePercentage,
          completions: dayCompletions,
          failed: dayFailed,
          incomplete: dayIncomplete,
          goals: dayGoals,
        })
      }
    } else if (periodDays === 90) {
      // Pour 3 mois : affichage par semaine
      const weeksToShow = 12 // 3 mois = ~12 semaines

      for (let i = weeksToShow - 1; i >= 0; i--) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() - i * 7)
        const startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 6)

        let weekCompletions = 0
        let weekFailed = 0
        let weekIncomplete = 0
        let weekGoals = 0

        // Calculer pour chaque jour de la semaine
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0]

          filteredHabits.forEach((habit) => {
            const completion = getHabitCompletion(habit.id, dateStr)

            if (completion === "completed") {
              weekCompletions++
            } else if (completion === "failed") {
              weekFailed++
            }

            const dailyGoal = Math.ceil(habit.weeklyTarget / 7)
            weekGoals += dailyGoal

            const totalRealized = (completion === "completed" ? 1 : 0) + (completion === "failed" ? 1 : 0)
            if (totalRealized < dailyGoal) {
              weekIncomplete += dailyGoal - totalRealized
            }
          })
        }

        const successPercentage = weekGoals > 0 ? Math.round((weekCompletions / weekGoals) * 100) : 0
        const failedPercentage = weekGoals > 0 ? Math.round((weekFailed / weekGoals) * 100) : 0
        const incompletePercentage = weekGoals > 0 ? Math.round((weekIncomplete / weekGoals) * 100) : 0

        const weekNumber = Math.ceil(weeksToShow - i)

        data.push({
          date: `S${weekNumber}`,
          fullDate: `Semaine du ${startDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}`,
          successPercentage,
          failedPercentage,
          incompletePercentage,
          completions: weekCompletions,
          failed: weekFailed,
          incomplete: weekIncomplete,
          goals: weekGoals,
        })
      }
    } else {
      // Pour 6 mois et 1 an : affichage par mois
      const monthsToShow = periodDays === 180 ? 6 : 12

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const currentDate = new Date()
        currentDate.setMonth(currentDate.getMonth() - i)

        // Premier jour du mois
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        // Dernier jour du mois
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        let monthCompletions = 0
        let monthFailed = 0
        let monthIncomplete = 0
        let monthGoals = 0

        // Calculer pour chaque jour du mois
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0]

          filteredHabits.forEach((habit) => {
            const completion = getHabitCompletion(habit.id, dateStr)

            if (completion === "completed") {
              monthCompletions++
            } else if (completion === "failed") {
              monthFailed++
            }

            const dailyGoal = Math.ceil(habit.weeklyTarget / 7)
            monthGoals += dailyGoal

            const totalRealized = (completion === "completed" ? 1 : 0) + (completion === "failed" ? 1 : 0)
            if (totalRealized < dailyGoal) {
              monthIncomplete += dailyGoal - totalRealized
            }
          })
        }

        const successPercentage = monthGoals > 0 ? Math.round((monthCompletions / monthGoals) * 100) : 0
        const failedPercentage = monthGoals > 0 ? Math.round((monthFailed / monthGoals) * 100) : 0
        const incompletePercentage = monthGoals > 0 ? Math.round((monthIncomplete / monthGoals) * 100) : 0

        data.push({
          date: startDate.toLocaleDateString("fr-FR", { month: "short" }),
          fullDate: startDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
          successPercentage,
          failedPercentage,
          incompletePercentage,
          completions: monthCompletions,
          failed: monthFailed,
          incomplete: monthIncomplete,
          goals: monthGoals,
        })
      }
    }

    return data
  }

  const evolutionData = generateEvolutionData()

  // Statistiques par habitude avec calculs pour la période
  const habitStats = filteredHabits
    .map((habit) => {
      let habitCompletions = 0

      // Calculer TOUTES les completions pour la période sélectionnée
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0]
        const completion = getHabitCompletion(habit.id, dateStr)

        if (completion === "completed") {
          habitCompletions++
        }
      }

      // L'objectif est basé sur le weeklyTarget de l'habitude
      let habitGoal = habit.weeklyTarget
      if (periodDays > 7) {
        habitGoal = Math.round((habit.weeklyTarget * periodDays) / 7)
      }

      // Calculer le streak actuel (depuis aujourd'hui vers le passé)
      const today = new Date()
      let streakCount = 0
      for (let i = 0; i < periodDays; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = checkDate.toISOString().split("T")[0]
        const completion = getHabitCompletion(habit.id, dateStr)

        if (completion === "completed") {
          streakCount++
        } else if (completion === "failed") {
          break
        }
        // Pour "incomplete", on continue si c'est aujourd'hui, sinon on s'arrête
        else if (i > 0) {
          break
        }
      }

      const completionRate = habitGoal > 0 ? Math.round((habitCompletions / habitGoal) * 100) : 0

      return {
        ...habit,
        periodCompletions: habitCompletions,
        periodScheduled: habitGoal,
        periodCompletionRate: completionRate,
        periodStreak: streakCount,
        weeklyProgress: habit.weeklyTarget > 0 ? (habit.currentWeekCompleted / habit.weeklyTarget) * 100 : 0,
      }
    })
    .sort((a, b) => b.periodCompletionRate - a.periodCompletionRate)

  const totalNotes = filteredNotes.length

  // Fonction pour obtenir les données du graphique selon le filtre
  const getChartData = () => {
    switch (statusFilter) {
      case "success":
        return { dataKey: "successPercentage", color: "#10B981", label: "Succès" }
      case "failed":
        return { dataKey: "failedPercentage", color: "#EF4444", label: "Échecs" }
      case "incomplete":
        return { dataKey: "incompletePercentage", color: "#F59E0B", label: "Non réalisés" }
      default:
        return { dataKey: "successPercentage", color: "#10B981", label: "Succès" }
    }
  }

  const chartConfig = getChartData()

  // Tooltip personnalisé pour le graphique
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data.fullDate}`}</p>
          <p className="text-green-600">{`Succès: ${data.successPercentage}% (${data.completions} cases cochées)`}</p>
          <p className="text-red-600">{`Échecs: ${data.failedPercentage}% (${data.failed} échecs)`}</p>
          <p className="text-orange-600">{`Objectif: ${data.goals} (basé sur weeklyTarget)`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4 min-h-screen pt-safe pt-8" style={{ backgroundColor: "#F2F2F2" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="text-2xl font-bold text-[#8789C0]">{t("analysesTitle")}</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Filtres */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block text-left">Habitudes</label>
            <Select value={selectedHabit} onValueChange={setSelectedHabit}>
              <SelectTrigger className="bg-white border-0">
                <div className="flex items-center gap-2 w-full min-w-0">
                  {selectedHabit === "all" ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-gradient-conic from-green-500 via-blue-500 to-purple-600 flex-shrink-0" />
                      <span className="truncate">{t("allHabits")}</span>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habits.find((h) => h.id === selectedHabit)?.color }}
                      />
                      <span className="truncate">{habits.find((h) => h.id === selectedHabit)?.name}</span>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-border">
                <SelectItem value="all">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div className="w-3 h-3 rounded-full bg-gradient-conic from-green-500 via-blue-500 to-purple-600 flex-shrink-0" />
                    <span className="truncate">{t("allHabits")}</span>
                  </div>
                </SelectItem>
                {habitsWithProgress.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                      <span className="truncate">{habit.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block text-left">{t("period")}</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-white border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-border">
                <SelectItem value="7">{t("days7")}</SelectItem>
                <SelectItem value="30">{t("month1")}</SelectItem>
                <SelectItem value="90">{t("months3")}</SelectItem>
                <SelectItem value="180">{t("months6")}</SelectItem>
                <SelectItem value="365">{t("year1")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* KPIs principaux - 4 indicateurs */}
        <div className="grid grid-cols-4 gap-1">
          <Card className="bg-white border-0">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-foreground">{periodStats.averageCompletion}%</div>
              <div className="text-xs text-muted-foreground">{t("progressPercent")}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-lg font-bold text-foreground">{periodStats.totalCompletions}</div>
              <div className="text-xs text-muted-foreground">{t("completedHabits")}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold text-foreground">{periodStats.maxStreak}</div>
              <div className="text-xs text-muted-foreground">{t("record")}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-lg font-bold text-foreground">{totalNotes}</div>
              <div className="text-xs text-muted-foreground">{t("notesTitle")}</div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Bien-être émotionnel - toujours affiché */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Smile className="h-5 w-5 text-yellow-500" />
              {t("emotionalWellbeing")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moodStats.totalMoods > 0 ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl mb-2">{moodStats.moodEmoji}</div>
                  <div className="text-2xl font-bold text-foreground">{moodStats.averageMood.toFixed(1)}/5</div>
                  <div className="text-sm text-muted-foreground">{t("averageMood")}</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">😊</div>
                  <div className="text-2xl font-bold text-green-600">{moodStats.positivePercentage}%</div>
                  <div className="text-sm text-muted-foreground">{t("positiveMoods")}</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-foreground">{moodStats.totalMoods}</div>
                  <div className="text-sm text-muted-foreground">{t("notesWithMood")}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😐</div>
                <h3 className="text-lg font-medium text-foreground mb-2">{t("noMoodData")}</h3>
                <p className="text-muted-foreground">{t("startWritingNotes")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique d'évolution avec filtres */}
        <Card className="bg-white border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground mb-4">
              <TrendingUp className="h-5 w-5 text-[#8789C0]" />
              {t("performanceEvolution")}
            </CardTitle>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant={statusFilter === "success" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("success")}
                className={`text-xs px-2 py-1 h-7 ${statusFilter === "success" ? "bg-green-500 hover:bg-green-600" : ""}`}
              >
                {t("success")}
              </Button>
              <Button
                variant={statusFilter === "failed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("failed")}
                className={`text-xs px-2 py-1 h-7 ${statusFilter === "failed" ? "bg-red-500 hover:bg-red-600" : ""}`}
              >
                {t("failures")}
              </Button>
              <Button
                variant={statusFilter === "incomplete" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("incomplete")}
                className={`text-xs px-2 py-1 h-7 ${statusFilter === "incomplete" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              >
                {t("notRealized")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={chartConfig.dataKey}
                    stroke={chartConfig.color}
                    strokeWidth={3}
                    dot={{ fill: chartConfig.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: chartConfig.color, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance par habitude */}
        <Card className="bg-white border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-[#8789C0]" />
              {t("performanceByHabit")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habitStats.map((habit) => (
              <div key={habit.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <span className="font-medium text-foreground">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {habit.periodCompletionRate}%
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {habit.periodCompletions}/{habit.periodScheduled}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(habit.periodCompletionRate, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {t("currentStreak")}: {habit.periodStreak} jours
                  </span>
                  <span>
                    {t("onPeriod")}: {habit.periodCompletionRate}%
                  </span>
                </div>
              </div>
            ))}

            {habitStats.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune habitude à analyser</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tendances */}
        <Card className="bg-white border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-green-500" />
              {t("trends")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-foreground">{t("mostRegularHabit")}</span>
                <div className="flex items-center gap-2">
                  {habitStats.length > 0 && (
                    <>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habitStats[0].color }} />
                      <span className="font-medium text-foreground">{habitStats[0].name}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-foreground">{t("notesInPeriod")}</span>
                <span className="font-medium text-foreground">{totalNotes}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-foreground">{t("globalProgression")}</span>
                <Badge
                  className={`${periodStats.averageCompletion >= 70 ? "bg-green-100 text-green-800" : periodStats.averageCompletion >= 40 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                >
                  {periodStats.averageCompletion >= 70
                    ? t("excellent")
                    : periodStats.averageCompletion >= 40
                      ? t("good")
                      : t("toImprove")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conseils */}
        <Card className="bg-gradient-to-r from-[#8789C0]/10 to-[#4ACB67]/10 border-[#8789C0]/20">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 text-foreground">{t("tipOfDay")}</h3>
            <p className="text-sm text-muted-foreground">
              {periodStats.averageCompletion >= 80
                ? t("excellentWork")
                : periodStats.averageCompletion >= 50
                  ? t("onRightTrack")
                  : t("startSmall")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
