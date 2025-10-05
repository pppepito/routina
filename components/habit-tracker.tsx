"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sun, ChevronLeft, ChevronRight, TrendingUp, Flame, CheckSquare, FileText, BarChart3, Target, Activity, StickyNote, Calendar, X, Check, User } from 'lucide-react'
import { useHabits } from "../hooks/use-habits"
import { useNotes } from "../hooks/use-notes"
import { HabitSettings } from "./habit-settings"
import { UserProfile } from "./user-profile"
import { Notes } from "./notes"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { GamificationHub } from "./gamification-hub"
import { HabitCalendar } from "./habit-calendar"
import { useTranslations } from "../hooks/use-translations"
import { Goals } from "./goals"

// Fonction utilitaire pour éviter les problèmes de fuseau horaire
const formatDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type View = "tracker" | "calendar" | "settings" | "notes" | "profile" | "analytics" | "gamification" | "goals"

export function HabitTracker() {
  const [currentView, setCurrentView] = useState<View>("tracker")
  const [currentTab, setCurrentTab] = useState<"week" | "month">("week")
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [showNotePopup, setShowNotePopup] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [selectedMood, setSelectedMood] = useState<"great" | "good" | "neutral" | "bad" | "terrible">("neutral")
  const [selectedHabitForNote, setSelectedHabitForNote] = useState<string | undefined>(undefined)
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())
  const [previousCompletedHabits, setPreviousCompletedHabits] = useState<Set<string>>(new Set())

  const {
    getHabitsWithProgress,
    toggleHabitCompletion,
    setHabitFailed,
    getHabitCompletion,
    isHabitScheduledForDay,
    habits,
    completions,
  } = useHabits()
  const { addNote } = useNotes()
  const { t } = useTranslations()

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const moods = [
    { value: "great", icon: "😄" },
    { value: "good", icon: "😊" },
    { value: "neutral", icon: "😐" },
    { value: "bad", icon: "😕" },
    { value: "terrible", icon: "😞" },
  ] as const

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      try {
        setCurrentView(event.detail)
      } catch (error) {
        console.error("Navigation error:", error)
      }
    }

    window.addEventListener("navigate", handleNavigate as EventListener)
    return () => window.removeEventListener("navigate", handleNavigate as EventListener)
  }, [])

  const getWeekDates = (offset = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset + offset * 7)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const getMonthDates = (offset = 0) => {
    const today = new Date()
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const year = targetMonth.getFullYear()
    const month = targetMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const monthDates = []

    // Add empty cells for days before the first day of the month
    const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    for (let i = 0; i < mondayBasedFirstDay; i++) {
      monthDates.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      monthDates.push(new Date(year, month, day))
    }

    return { monthDates, year, month, daysInMonth }
  }

  // Calculer les habitudes avec progrès de manière stable
  const habitsWithProgress = useMemo(() => {
    return getHabitsWithProgress()
  }, [habits, completions])

  // Créer une clé stable pour détecter les changements de progression
  const progressKey = useMemo(() => {
    const weekDates = getWeekDates(weekOffset)
    return habits
      .map((habit) => {
        const completions = weekDates.reduce((acc, date) => {
          if (getHabitCompletion(habit.id, date.toISOString().split("T")[0]) === "completed") {
            return acc + 1
          }
          return acc
        }, 0)
        const progress = habit.weeklyTarget > 0 ? (completions / habit.weeklyTarget) * 100 : 0
        return `${habit.id}:${progress >= 100 ? "100" : "incomplete"}`
      })
      .join("|")
  }, [habits, completions, weekOffset, getHabitCompletion])

  // Détecter les nouvelles completions à 100% et déclencher l'effet temporaire
  useEffect(() => {
    const newCompletedHabits = new Set<string>()
    const currentCompletedHabits = new Set<string>()

    habitsWithProgress.forEach((habit) => {
      const weekDates = getWeekDates(weekOffset)
      const completions = weekDates.reduce((acc, date) => {
        if (getHabitCompletion(habit.id, date.toISOString().split("T")[0]) === "completed") {
          return acc + 1
        }
        return acc
      }, 0)
      const progress = habit.weeklyTarget > 0 ? (completions / habit.weeklyTarget) * 100 : 0

      if (progress >= 100) {
        currentCompletedHabits.add(habit.id)
        if (!previousCompletedHabits.has(habit.id) && !completedHabits.has(habit.id)) {
          newCompletedHabits.add(habit.id)
        }
      }
    })

    setPreviousCompletedHabits(currentCompletedHabits)

    if (newCompletedHabits.size > 0) {
      setCompletedHabits((prev) => new Set([...prev, ...newCompletedHabits]))
      setTimeout(() => {
        setCompletedHabits((prev) => {
          const updated = new Set(prev)
          newCompletedHabits.forEach((id) => updated.delete(id))
          return updated
        })
      }, 2000)
    }
  }, [progressKey])

  const navigateWeek = (direction: "prev" | "next") => {
    setWeekOffset((prev) => (direction === "prev" ? prev - 1 : prev + 1))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setMonthOffset((prev) => (direction === "prev" ? prev - 1 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 50) {
      if (currentTab === "week") navigateWeek("next")
      else navigateMonth("next")
    }
    if (distance < -50) {
      if (currentTab === "week") navigateWeek("prev")
      else navigateMonth("prev")
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const handleToggleCompletion = (habitId: string, date: string) => {
    try {
      const currentStatus = getHabitCompletion(habitId, date)
      if (currentStatus === "completed") {
        setHabitFailed(habitId, date)
      } else if (currentStatus === "failed") {
        toggleHabitCompletion(habitId, date)
      } else {
        // Permettre de marquer comme complété même si pas programmé
        toggleHabitCompletion(habitId, date)
      }
    } catch (error) {
      console.error("Error toggling habit completion:", error)
    }
  }

  const handleOpenNotePopup = (habitId?: string) => {
    setSelectedHabitForNote(habitId)
    setShowNotePopup(true)
  }

  const handleAddNote = () => {
    if (noteContent.trim()) {
      addNote(noteContent, selectedHabitForNote, selectedMood)
      setNoteContent("")
      setSelectedMood("neutral")
      setSelectedHabitForNote(undefined)
      setShowNotePopup(false)
    }
  }

  const handleCloseNotePopup = () => {
    setShowNotePopup(false)
    setNoteContent("")
    setSelectedMood("neutral")
    setSelectedHabitForNote(undefined)
  }

  const handleViewChange = (newView: View) => {
    setCurrentView(newView)
  }

  const getMonthStats = () => {
    const { year, month, daysInMonth } = getMonthDates(monthOffset)

    let totalCompletions = 0
    let totalPossible = 0 // Total possible (habitudes × jours)
    let maxStreak = 0

    // CORRECTION : Compter TOUTES les habitudes complétées, pas seulement les programmées
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = formatDateString(date)

      habitsWithProgress.forEach((habit) => {
        // Compter toutes les habitudes pour chaque jour
        totalPossible++
        if (getHabitCompletion(habit.id, dateStr) === "completed") {
          totalCompletions++
        }
      })
    }

    // Calculate max streak
    habitsWithProgress.forEach((habit) => {
      if (habit.streak > maxStreak) {
        maxStreak = habit.streak
      }
    })

    const progressPercent = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0

    return {
      progressPercent,
      completions: totalCompletions,
      totalScheduled: totalPossible, // Renommé pour cohérence
      maxStreak,
      activeHabits: habitsWithProgress.length,
    }
  }

  const renderWeekView = () => {
    const weekDates = getWeekDates(weekOffset)
    const dayLabels = [t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat"), t("sun")]
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

    const currentMonthName = getMonthName(weekDates[0])

    let totalCompletionsThisWeek = 0
    let totalScheduledThisWeek = 0

    habitsWithProgress.forEach((habit) => {
      totalScheduledThisWeek += habit.weeklyTarget
      weekDates.forEach((date) => {
        if (getHabitCompletion(habit.id, date.toISOString().split("T")[0]) === "completed") {
          totalCompletionsThisWeek++
        }
      })
    })

    const overallWeekProgress =
      totalScheduledThisWeek > 0 ? Math.round((totalCompletionsThisWeek / totalScheduledThisWeek) * 100) : 0
    const overallStreak = habitsWithProgress.length > 0 ? Math.max(...habitsWithProgress.map((h) => h.streak)) : 0

    return (
      <>
        {/* Calendar Navigation */}
        <div className="px-3 pb-3" style={{ backgroundColor: "#F2F2F2" }}>
          <div className="flex items-center justify-center mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("prev")}
              className="text-muted-foreground w-8 h-8"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground capitalize text-base">{currentMonthName}</span>
              {weekOffset !== 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWeekOffset(0)}
                  className="text-[#8789C0] hover:text-[#8789C0]/80 w-6 h-6"
                  title="Revenir à cette semaine"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("next")}
              className="text-muted-foreground w-8 h-8"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-x-2 mb-3">
            {dayLabels.map((label, index) => {
              const isToday = weekDates[index].toDateString() === new Date().toDateString()
              return (
                <div key={`${label}-${index}`} className="text-center">
                  <div
                    className={`font-medium text-xs mb-1 ${isToday ? "text-[#8789C0] font-bold" : "text-muted-foreground"}`}
                  >
                    {label}
                  </div>
                  <div
                    className={`font-medium text-sm w-6 h-6 flex items-center justify-center mx-auto ${
                      isToday ? "text-[#8789C0] font-bold bg-[#8789C0]/10 rounded-full" : "text-foreground"
                    }`}
                  >
                    {weekDates[index].getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2 bg-muted/20 rounded-lg p-1.5">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
              </div>
              <div className="text-sm font-bold text-foreground">{overallWeekProgress}%</div>
              <div className="text-xs text-muted-foreground">{t("progressPercent")}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-3 w-3 text-green-500" />
              </div>
              <div className="text-sm font-bold text-foreground">
                {totalCompletionsThisWeek}/{totalScheduledThisWeek}
              </div>
              <div className="text-xs text-muted-foreground">{t("completedHabits")}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Flame className="h-3 w-3 text-orange-500" />
              </div>
              <div className="text-sm font-bold text-foreground">{overallStreak}</div>
              <div className="text-xs text-muted-foreground">{t("record")}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-3 w-3 text-purple-500" />
              </div>
              <div className="text-sm font-bold text-foreground">{habitsWithProgress.length}</div>
              <div className="text-xs text-muted-foreground">{t("activeHabits")}</div>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="px-3 space-y-2 pb-4" style={{ backgroundColor: "#F2F2F2" }}>
          {habitsWithProgress.map((habit) => {
            const completions = weekDates.reduce((acc, date) => {
              if (getHabitCompletion(habit.id, date.toISOString().split("T")[0]) === "completed") {
                return acc + 1
              }
              return acc
            }, 0)
            const progress = habit.weeklyTarget > 0 ? (completions / habit.weeklyTarget) * 100 : 0
            const isCompleted = progress >= 100
            const isJustCompleted = completedHabits.has(habit.id)

            return (
              <div key={habit.id} className="relative bg-white rounded-lg p-3 transition-all duration-300 border-0">
                <div className="w-full bg-muted rounded-full h-1 mb-2 relative z-10">
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: isJustCompleted ? "#10B981" : habit.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">
                        {completions}/{habit.weeklyTarget}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-orange-500">{habit.streak}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-600 w-8 h-8"
                      onClick={() => handleOpenNotePopup(habit.id)}
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isJustCompleted && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-medium animate-fade-in-out">
                        <Check className="h-3 w-3" />
                        <span>{t("reached")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-foreground mb-2">{habit.name}</h3>

                <div className="grid grid-cols-7 gap-x-3 relative z-10">
                  {weekDates.map((date) => {
                    const dateStr = formatDateString(date)
                    const status = getHabitCompletion(habit.id, dateStr)
                    const scheduled = isHabitScheduledForDay(habit, date)

                    let checkboxStyle = { backgroundColor: "#F3F4F6" }
                    let showPastille = false
                    let pastilleColor = "#BFBFBF"

                    if (status === "completed") {
                      checkboxStyle = { backgroundColor: habit.color }
                      pastilleColor = "white"
                      showPastille = scheduled
                    } else if (status === "failed") {
                      checkboxStyle = { backgroundColor: "#EF4444" }
                      pastilleColor = "white"
                      showPastille = scheduled
                    } else if (status === "incomplete" && scheduled) {
                      checkboxStyle = { backgroundColor: "#F3F4F6" }
                      pastilleColor = "#BFBFBF"
                      showPastille = true
                    }

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleToggleCompletion(habit.id, dateStr)}
                        className="h-10 w-10 flex items-center justify-center transition-colors rounded-md hover:bg-muted cursor-pointer"
                        aria-label={`Marquer ${habit.name} pour ${date.toLocaleDateString()}`}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center transition-all duration-200"
                          style={checkboxStyle}
                        >
                          {showPastille && (
                            <div
                              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                              style={{ backgroundColor: pastilleColor }}
                            />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const renderMonthView = () => {
    const { monthDates, year, month, daysInMonth } = getMonthDates(monthOffset)
    const monthStats = getMonthStats()

    const getMonthName = (monthIndex: number) => {
      const months = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ]
      return months[monthIndex]
    }

    const dayLabels = ["L", "Ma", "Me", "J", "V", "S", "D"]

    return (
      <>
        {/* Month Navigation */}
        <div className="px-3 pb-3" style={{ backgroundColor: "#F2F2F2" }}>
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("prev")}
              className="text-muted-foreground w-8 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground text-base">
                {getMonthName(month)} {year}
              </span>
              {monthOffset !== 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMonthOffset(0)}
                  className="text-[#8789C0] hover:text-[#8789C0]/80 w-6 h-6"
                  title="Revenir à ce mois"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("next")}
              className="text-muted-foreground w-8 h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg p-3 mb-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((label) => (
                <div key={label} className="text-center text-xs font-medium text-muted-foreground p-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square"></div>
                }

                const dateStr = formatDateString(date)
                const isToday = date.toDateString() === new Date().toDateString()

                // Calculate completion status for this day
                let dayCompletions = 0
                let dayTotal = 0

                habitsWithProgress.forEach((habit) => {
                  const status = getHabitCompletion(habit.id, formatDateString(date))
                  const scheduled = isHabitScheduledForDay(habit, date)

                  // Compter toutes les habitudes (programmées ou non)
                  dayTotal++
                  if (status === "completed") {
                    dayCompletions++
                  }
                })

                let bgColor = "bg-gray-100"
                if (dayTotal > 0) {
                  const completionRate = (dayCompletions / dayTotal) * 100
                  if (completionRate === 100) {
                    bgColor = "bg-[#8789C0]"
                  } else if (completionRate > 0) {
                    bgColor = "bg-[#8789C0]/30"
                  }
                }

                return (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded text-sm transition-colors ${bgColor} ${
                      isToday ? "ring-2 ring-[#8789C0] ring-offset-1" : ""
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        bgColor === "bg-[#8789C0]" ? "text-white" : isToday ? "text-[#8789C0]" : "text-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Month Stats */}
          <div className="grid grid-cols-4 gap-2 bg-muted/20 rounded-lg p-2">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
              </div>
              <div className="text-base font-bold text-foreground">{monthStats.progressPercent}%</div>
              <div className="text-xs text-muted-foreground">Progrès</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-3 w-3 text-green-500" />
              </div>
              <div className="text-base font-bold text-foreground">
                {monthStats.completions}/{monthStats.totalScheduled}
              </div>
              <div className="text-xs text-muted-foreground">Complétées</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Flame className="h-3 w-3 text-orange-500" />
              </div>
              <div className="text-base font-bold text-foreground">{monthStats.maxStreak}</div>
              <div className="text-xs text-muted-foreground">Record</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-3 w-3 text-purple-500" />
              </div>
              <div className="text-base font-bold text-foreground">{monthStats.activeHabits}</div>
              <div className="text-xs text-muted-foreground">Habitudes</div>
            </div>
          </div>
        </div>

        {/* Habits Detail List for Month */}
        <div className="px-3 space-y-2 pb-4" style={{ backgroundColor: "#F2F2F2" }}>
          {habitsWithProgress.map((habit) => {
            const { year, month, daysInMonth } = getMonthDates(monthOffset)

            // Calculate monthly progress - CORRECTION DU BUG
            let monthlyCompletions = 0
            const monthlyTotal = daysInMonth // Total des jours du mois

            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day)
              const dateStr = formatDateString(date)

              // Compter TOUTES les habitudes complétées, programmées ou non
              if (getHabitCompletion(habit.id, dateStr) === "completed") {
                monthlyCompletions++
              }
            }

            return (
              <div key={habit.id} className="bg-white rounded-lg p-3">
                {/* Habit header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">
                        {monthlyCompletions}/{monthlyTotal}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-orange-500">{habit.streak}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-600 w-8 h-8"
                      onClick={() => handleOpenNotePopup(habit.id)}
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-medium text-foreground mb-2">{habit.name}</h3>

                {/* Monthly completion grid */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDates.map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-8 w-8"></div>
                    }

                    const day = date.getDate()
                    const dateStr = formatDateString(date)
                    const status = getHabitCompletion(habit.id, dateStr)
                    const scheduled = isHabitScheduledForDay(habit, date)

                    let checkboxStyle = { backgroundColor: "#F3F4F6" }
                    let showPastille = false
                    let pastilleColor = "#BFBFBF"

                    if (status === "completed") {
                      checkboxStyle = { backgroundColor: habit.color }
                      pastilleColor = "white"
                      // CORRECTION : Pastille SEULEMENT si programmé
                      showPastille = scheduled
                    } else if (status === "failed") {
                      checkboxStyle = { backgroundColor: "#EF4444" }
                      pastilleColor = "white"
                      // CORRECTION : Pastille SEULEMENT si programmé
                      showPastille = scheduled
                    } else if (scheduled) {
                      checkboxStyle = { backgroundColor: "#F3F4F6" }
                      pastilleColor = "#BFBFBF"
                      showPastille = true
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleToggleCompletion(habit.id, dateStr)}
                        className="h-8 w-8 flex items-center justify-center transition-colors rounded-md hover:bg-muted cursor-pointer"
                        aria-label={`Marquer ${habit.name} pour le ${day}`}
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center transition-all duration-200"
                          style={checkboxStyle}
                        >
                          {showPastille && (
                            <div
                              className="w-1 h-1 rounded-full transition-all duration-200"
                              style={{ backgroundColor: pastilleColor }}
                            />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const renderTracker = () => {
    return (
      <div
        className="min-h-screen mt-0 pt-8"
        style={{ backgroundColor: "#F2F2F2" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 px-4 py-4 pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
          <h1 className="font-bold text-[#8789C0] text-2xl">{t("tracking")}</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("profile")}
              className="rounded-full bg-teal-400 hover:bg-teal-500 text-white w-10 h-10 p-0 transition-colors"
              title="Accéder au profil"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation - Même style que les paramètres */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mx-4 mb-2">
          <button
            onClick={() => setCurrentTab("week")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentTab === "week"
                ? "bg-white text-[#8789C0] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setCurrentTab("month")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentTab === "month"
                ? "bg-white text-[#8789C0] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mois
          </button>
        </div>

        {/* Main Content */}
        {currentTab === "week" ? renderWeekView() : renderMonthView()}

        {/* No habits message */}
        {habitsWithProgress.length === 0 && (
          <div className="text-center py-12 px-4" style={{ backgroundColor: "#F2F2F2" }}>
            <Sun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t("noHabitsConfigured")}</h3>
            <p className="text-muted-foreground mb-4">Créez votre première habitude pour commencer</p>
            <Button onClick={() => setCurrentView("settings")} className="bg-[#8789C0] hover:bg-[#8789C0]/90">
              {t("createFirstHabit")}
            </Button>
          </div>
        )}

        {/* Note Popup */}
        {showNotePopup && (
          <div className="fixed inset-0 z-40 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/50 transition-opacity duration-300"
              onClick={handleCloseNotePopup}
            />
            <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-100px)]">
              <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedHabitForNote
                    ? `${t("noteFor")} ${habits.find((h) => h.id === selectedHabitForNote)?.name}`
                    : t("quickNote")}
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCloseNotePopup} className="w-8 h-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t("howDoYouFeel")}</label>
                    <div className="grid grid-cols-5 gap-2">
                      {moods.map((mood) => (
                        <button
                          key={mood.value}
                          type="button"
                          onClick={() => setSelectedMood(mood.value)}
                          className={`aspect-square flex items-center justify-center p-2 rounded-lg border-2 transition-all ${
                            selectedMood === mood.value
                              ? "border-[#8789C0] bg-[#8789C0]/10 scale-105"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <span className="text-2xl">{mood.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t("yourNote")}</label>
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder={t("whatHappenedToday")}
                      rows={4}
                      className="resize-none bg-white border-border text-foreground"
                    />
                  </div>
                  <div className="h-20"></div>
                </div>
              </div>
              <div className="flex-shrink-0 p-4 border-t border-border bg-white pb-20">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddNote}
                    className="flex-1 bg-[#8789C0] hover:bg-[#8789C0]/90 h-12 text-base font-medium"
                  >
                    {t("createNote")}
                  </Button>
                  <Button variant="outline" onClick={handleCloseNotePopup} className="h-12 px-6 bg-transparent">
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
      <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: "#F2F2F2" }}>
        <div className="pb-16">
          {currentView === "tracker" && renderTracker()}
          {currentView === "calendar" && <HabitCalendar />}
          {currentView === "settings" && <HabitSettings />}
          {currentView === "notes" && <Notes />}
          {currentView === "profile" && <UserProfile />}
          {currentView === "analytics" && <AnalyticsDashboard />}
          {currentView === "gamification" && <GamificationHub />}
          {currentView === "goals" && <Goals />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t border-border shadow-lg z-[9999] mb-0 pb-5">
          <div className="grid grid-cols-5">
            {[
              { view: "settings", label: "Habitudes", icon: Sun },
              { view: "tracker", label: "Suivi", icon: CheckSquare },
              { view: "notes", label: "Notes", icon: FileText },
              { view: "analytics", label: "Analyses", icon: BarChart3 },
              { view: "goals", label: "Objectifs", icon: Target },
            ].map(({ view, label, icon: Icon }) => (
              <button
                key={view}
                onClick={() => handleViewChange(view as View)}
                className="flex flex-col items-center py-2 px-1 transition-colors text-muted-foreground"
                style={currentView === view ? { color: "#8789C0" } : { color: "#6B7280" }}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HabitTracker
