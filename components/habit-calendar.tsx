"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Target, Flame } from "lucide-react"
import { useHabits } from "../hooks/use-habits"
import { useTranslations } from "../hooks/use-translations"

export function HabitCalendar() {
  const { habits, completions } = useHabits()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { t } = useTranslations()

  // Obtenir le premier jour du mois
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Générer les jours du calendrier
  const calendarDays = []

  // Jours vides au début
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getCompletionsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
    return completions.filter((c) => c.date === dateStr && c.status === "completed")
  }

  const getCompletionRate = (day: number) => {
    const dayCompletions = getCompletionsForDate(day)
    const activeHabitsCount = habits.filter((h) => h.isActive).length
    if (activeHabitsCount === 0) return 0
    return (dayCompletions.length / activeHabitsCount) * 100
  }

  const getDayColor = (day: number) => {
    const rate = getCompletionRate(day)
    if (rate === 0) return "bg-gray-100"
    if (rate < 50) return "bg-red-200"
    if (rate < 100) return "bg-yellow-200"
    return "bg-green-200"
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Calculer les statistiques du mois
  const monthCompletions = completions.filter((c) => {
    const completionDate = new Date(c.date)
    return (
      completionDate.getMonth() === currentDate.getMonth() &&
      completionDate.getFullYear() === currentDate.getFullYear() &&
      c.status === "completed"
    )
  })

  const perfectDays = []
  for (let day = 1; day <= daysInMonth; day++) {
    const rate = getCompletionRate(day)
    if (rate === 100 && habits.filter((h) => h.isActive).length > 0) {
      perfectDays.push(day)
    }
  }

  const getMonthName = (date: Date) => {
    const months = [
      t("january"),
      t("february"),
      t("march"),
      t("april"),
      t("may"),
      t("june"),
      t("july"),
      t("august"),
      t("september"),
      t("october"),
      t("november"),
      t("december"),
    ]
    return months[date.getMonth()]
  }

  const dayNames = [t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F2F2" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="font-bold text-[#8789C0] text-2xl">{t("calendar")}</h1>
        <Calendar className="h-6 w-6 text-[#8789C0]" />
      </div>

      <div className="px-4 space-y-4 pb-24">
        {/* Navigation du mois */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {getMonthName(currentDate)} {currentDate.getFullYear()}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistiques du mois */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{monthCompletions.length}</div>
              <div className="text-xs text-muted-foreground">{t("completions")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold">{perfectDays.length}</div>
              <div className="text-xs text-muted-foreground">{t("perfectDays")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">
                {monthCompletions.length > 0 ? Math.round((perfectDays.length / daysInMonth) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">{t("successRate")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendrier */}
        <Card>
          <CardContent className="p-4">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day ? (
                    <div
                      className={`
                        w-full h-full flex flex-col items-center justify-center rounded-lg border text-sm
                        ${getDayColor(day)}
                        ${isToday(day) ? "ring-2 ring-[#8789C0] ring-offset-1" : ""}
                      `}
                    >
                      <div className={`font-medium ${isToday(day) ? "text-[#8789C0]" : ""}`}>{day}</div>
                      {getCompletionsForDate(day).length > 0 && (
                        <div className="text-xs mt-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {getCompletionsForDate(day).length}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Aucune</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>Partielle</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                <span>Bonne</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>Parfaite</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Habitudes actives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("trackedHabits")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {habits
                .filter((h) => h.isActive)
                .map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                      <span className="text-sm font-medium">{habit.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {
                        completions.filter(
                          (c) =>
                            c.habitId === habit.id &&
                            c.status === "completed" &&
                            new Date(c.date).getMonth() === currentDate.getMonth() &&
                            new Date(c.date).getFullYear() === currentDate.getFullYear(),
                        ).length
                      }{" "}
                      {t("thisMonth")}
                    </Badge>
                  </div>
                ))}
              {habits.filter((h) => h.isActive).length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">{t("noActiveHabits")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
