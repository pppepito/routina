"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Edit, Plus, GripVertical, Bell, X, Calendar } from 'lucide-react'
import { useHabits } from "../hooks/use-habits"
import { useReminders } from "../hooks/use-reminders"
import { useSettings } from "../hooks/use-settings"
import type { Habit } from "../types/habit"
import { useTranslations } from "../hooks/use-translations"

export function HabitSettings() {
  const { habits, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits()
  const { reminders, addReminder, updateReminder, deleteReminder, getRemindersForHabit } = useReminders()
  const { settings, updateSetting } = useSettings()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"habits" | "reminders">("habits")
  const [isAddingReminder, setIsAddingReminder] = useState(false)
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null)
  const { t } = useTranslations()

  // Drag & Drop mobile amélioré - CORRIGÉ pour éviter conflit avec scroll
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartTime, setDragStartTime] = useState<number | null>(null)
  const dragItemRef = useRef<HTMLDivElement | null>(null)

  // Seuils pour différencier scroll et drag - CORRIGÉ pour éviter conflits
  const DRAG_THRESHOLD = 20 // pixels - augmenté
  const DRAG_TIME_THRESHOLD = 500 // ms - augmenté
  const HORIZONTAL_THRESHOLD = 15 // pixels - nouveau seuil horizontal

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4ACB67",
    frequency: "daily" as const,
    targetDays: [1, 2, 3, 4, 5] as number[],
  })

  const [reminderForm, setReminderForm] = useState({
    habitId: "",
    time: "08:00",
    days: [1, 2, 3, 4, 5] as number[],
    message: "",
  })

  const colors = [
    { name: "Vert Menthe", value: "#4ACB67" },
    { name: "Bleu Océan", value: "#3B82F6" },
    { name: "Violet Royal", value: "#8B5CF6" },
    { name: "Orange Sunset", value: "#F59E0B" },
    { name: "Rouge Passion", value: "#EF4444" },
    { name: "Rose Sakura", value: "#EC4899" },
    { name: "Turquoise", value: "#06B6D4" },
    { name: "Indigo Nuit", value: "#6366F1" },
    { name: "Emeraude", value: "#10B981" },
    { name: "Ambre", value: "#D97706" },
  ]

  const daysOfWeek = [
    { label: t("mon"), value: 1, name: t("monday") },
    { label: t("tue"), value: 2, name: t("tuesday") },
    { label: t("wed"), value: 3, name: t("wednesday") },
    { label: t("thu"), value: 4, name: t("thursday") },
    { label: t("fri"), value: 5, name: t("friday") },
    { label: t("sat"), value: 6, name: t("saturday") },
    { label: t("sun"), value: 0, name: t("sunday") },
  ]

  // Drag & Drop CORRIGÉ - Support desktop ET mobile
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newHabits = [...habits]
      const draggedHabit = newHabits[draggedIndex]
      newHabits.splice(draggedIndex, 1)
      newHabits.splice(dropIndex, 0, draggedHabit)
      reorderHabits(newHabits)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Touch events pour mobile - CORRIGÉ
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setTouchStartX(touch.clientX)
    setDraggedIndex(index)
    setDragStartTime(Date.now())
    setIsDragging(false) // Ne pas commencer le drag immédiatement
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || !touchStartY || !touchStartX) return

    const touch = e.touches[0]
    const deltaY = Math.abs(touch.clientY - touchStartY)
    const deltaX = Math.abs(touch.clientX - touchStartX)
    const currentTime = Date.now()

    // Si le mouvement est principalement horizontal, ne pas drag
    if (deltaX > HORIZONTAL_THRESHOLD) {
      return
    }

    // Si c'est un mouvement principalement vertical mais pas assez important, ne pas drag
    if (deltaY < DRAG_THRESHOLD) {
      return
    }

    // Si on n'a pas maintenu assez longtemps, ne pas drag
    if (dragStartTime && currentTime - dragStartTime < DRAG_TIME_THRESHOLD) {
      return
    }

    // Vérifier que le mouvement vertical est significativement plus important que l'horizontal
    if (deltaY < deltaX * 1.5) {
      return
    }

    // Maintenant on peut commencer le drag
    if (!isDragging) {
      setIsDragging(true)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }

    e.preventDefault()
    setTouchCurrentY(touch.clientY)

    const itemHeight = 80
    const newIndex = Math.max(
      0,
      Math.min(habits.length - 1, draggedIndex + Math.round((touch.clientY - touchStartY) / itemHeight)),
    )

    if (newIndex !== dragOverIndex) {
      setDragOverIndex(newIndex)
    }
  }

  const handleTouchEnd = () => {
    if (isDragging && draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newHabits = [...habits]
      const draggedHabit = newHabits[draggedIndex]
      newHabits.splice(draggedIndex, 1)
      newHabits.splice(dragOverIndex, 0, draggedHabit)
      reorderHabits(newHabits)
    }

    // Reset tous les états
    setIsDragging(false)
    setDraggedIndex(null)
    setDragOverIndex(null)
    setTouchStartY(null)
    setTouchStartX(null)
    setTouchCurrentY(null)
    setDragStartTime(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const weeklyTarget = formData.targetDays.length

    if (editingId) {
      updateHabit(editingId, {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        frequency: formData.frequency,
        weeklyTarget: weeklyTarget,
        targetDays: formData.targetDays,
      })
      setEditingId(null)
    } else {
      addHabit({
        name: formData.name,
        description: formData.description,
        color: formData.color,
        frequency: formData.frequency,
        weeklyTarget: weeklyTarget,
        targetDays: formData.targetDays,
        isActive: true,
      })
      // Naviguer vers la page de suivi après création
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("navigate", { detail: "tracker" }))
      }, 100)
    }

    setIsAdding(false)
    setFormData({
      name: "",
      description: "",
      color: "#4ACB67",
      frequency: "daily",
      targetDays: [1, 2, 3, 4, 5],
    })
  }

  const handleEdit = (habit: Habit) => {
    setFormData({
      name: habit.name,
      description: habit.description || "",
      color: habit.color,
      frequency: habit.frequency,
      targetDays: habit.targetDays || [1, 2, 3, 4, 5],
    })
    setEditingId(habit.id)
    setIsAdding(true)
  }

  const handleEditReminder = (reminder: any) => {
    setReminderForm({
      habitId: reminder.habitId,
      time: reminder.time,
      days: reminder.days,
      message: reminder.message || "",
    })
    setEditingReminderId(reminder.id)
    setIsAddingReminder(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      color: "#4ACB67",
      frequency: "daily",
      targetDays: [1, 2, 3, 4, 5],
    })
  }

  const toggleDay = (dayValue: number) => {
    setFormData((prev) => ({
      ...prev,
      targetDays: prev.targetDays.includes(dayValue)
        ? prev.targetDays.filter((d) => d !== dayValue)
        : [...prev.targetDays, dayValue].sort(),
    }))
  }

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reminderForm.habitId || !reminderForm.time) return

    if (editingReminderId) {
      updateReminder(editingReminderId, {
        habitId: reminderForm.habitId,
        time: reminderForm.time,
        days: reminderForm.days,
        message: reminderForm.message || `Il est temps pour votre habitude !`,
      })
      setEditingReminderId(null)
    } else {
      addReminder({
        habitId: reminderForm.habitId,
        time: reminderForm.time,
        days: reminderForm.days,
        message: reminderForm.message || `Il est temps pour votre habitude !`,
        enabled: true,
      })
    }

    setReminderForm({
      habitId: "",
      time: "08:00",
      days: [1, 2, 3, 4, 5],
      message: "",
    })

    setIsAddingReminder(false)
  }

  const handleCancelReminder = () => {
    setIsAddingReminder(false)
    setEditingReminderId(null)
    setReminderForm({
      habitId: "",
      time: "08:00",
      days: [1, 2, 3, 4, 5],
      message: "",
    })
  }

  // Composant de skeleton pour le chargement
  const HabitSkeleton = () => (
    <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm border-t border-border pt-3">
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  )

  const renderHabitsTab = () => {
    // Afficher le skeleton pendant le chargement
    return (
      <div className="space-y-4">
        {habits.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t("myHabits")}</h2>

            {habits.map((habit, index) => (
              <Card
                key={habit.id}
                ref={draggedIndex === index ? dragItemRef : null}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`transition-all duration-300 ease-out select-none bg-white border-0 ${
                  draggedIndex === index
                    ? "opacity-70 scale-95 z-50 shadow-2xl"
                    : dragOverIndex === index
                      ? "border-2 border-[#8789C0] border-dashed bg-[#8789C0]/5 transform translate-y-1"
                      : ""
                } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{
                  transform:
                    draggedIndex === index && touchCurrentY && touchStartY && isDragging
                      ? `translateY(${touchCurrentY - touchStartY}px)`
                      : undefined,
                  boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)",
                  touchAction: isDragging ? "none" : "auto", // Empêche le scroll pendant le drag
                }}
              >
                <CardContent className="p-4">
                  {/* Header avec info principale et actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0 hover:text-foreground transition-colors" />
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">{habit.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions horizontales */}
                    <div
                      className="flex gap-1 flex-shrink-0"
                      onTouchStart={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.stopPropagation()}
                      style={{ pointerEvents: "auto" }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(habit)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 w-8 h-8 p-0 transition-colors"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-8 h-8 p-0 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Corps avec badges et informations */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                        <span className="text-xs font-medium text-foreground">
                          Objectif: {habit.weeklyTarget} jours
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                        <span className="text-xs font-medium text-foreground">
                          Jours:{" "}
                          {habit.targetDays?.map((d) => daysOfWeek.find((day) => day.value === d)?.label).join(", ") ||
                            "Tous"}
                        </span>
                      </div>
                      {getRemindersForHabit(habit.id).length > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#8789C0]/10 rounded-full border border-[#8789C0]/20">
                          <Bell className="h-3 w-3 text-[#8789C0]" />
                          <span className="text-xs font-medium text-[#8789C0]">
                            {getRemindersForHabit(habit.id).length}{" "}
                            {getRemindersForHabit(habit.id).length > 1 ? t("reminders_plural") : t("reminder")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer avec métadonnées */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">Créée le {habit.createdAt.toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {habits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune habitude configurée</h3>
            <p className="text-muted-foreground mb-4">Créez votre première habitude pour commencer</p>
            <Button onClick={() => setIsAdding(true)} className="bg-[#8789C0] hover:bg-[#8789C0]/90">
              Créer ma première habitude
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderRemindersTab = () => (
    <div className="space-y-4">
      {reminders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{t("myReminders")}</h2>

          {reminders.map((reminder) => {
            const habit = habits.find((h) => h.id === reminder.habitId)
            return (
              <Card
                key={reminder.id}
                className="bg-white border-0 transition-all duration-200"
                style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}
              >
                <CardContent className="p-3">
                  {/* Header avec info principale et actions */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#8789C0]/10 dark:bg-[#8789C0]/20 flex items-center justify-center flex-shrink-0">
                        <Bell className="h-4 w-4 text-[#8789C0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">{habit?.name}</h3>
                          <Switch
                            checked={reminder.enabled}
                            onCheckedChange={(enabled) => updateReminder(reminder.id, { enabled })}
                            className="data-[state=checked]:bg-green-500 scale-75"
                          />
                        </div>
                        {reminder.message && reminder.message !== "Il est temps pour votre habitude !" && (
                          <p className="text-sm text-muted-foreground truncate">"{reminder.message}"</p>
                        )}
                      </div>
                    </div>

                    {/* Actions horizontales */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReminder(reminder)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 w-8 h-8 p-0 transition-colors"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-8 h-8 p-0 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Corps avec badges - plus compact */}
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                        <span className="text-xs font-medium text-foreground">{reminder.time}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                        <span className="text-xs font-medium text-foreground">
                          {reminder.days.map((d) => daysOfWeek.find((day) => day.value === d)?.label).join(", ")}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full ${reminder.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                      >
                        <span className="text-xs font-medium">{reminder.enabled ? t("active") : t("inactive")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer avec métadonnées - plus compact */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                    <div className="flex items-center gap-1">
                      <Bell className="h-3 w-3 flex-shrink-0" />
                      <span>
                        {t("reminderFor")} {habit?.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun rappel configuré</h3>
          <p className="text-muted-foreground mb-4">Créez des rappels pour ne jamais oublier vos habitudes</p>
          {habits.length > 0 ? (
            <Button onClick={() => setIsAddingReminder(true)} className="bg-[#8789C0] hover:bg-[#8789C0]/90">
              Créer mon premier rappel
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vous devez d'abord créer des habitudes pour pouvoir configurer des rappels
            </p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 min-h-screen pt-safe pt-8" style={{ backgroundColor: "#F2F2F2" }}>
      {/* Header avec titre centré et bouton retour */}
      <div className="flex items-center justify-between p-4 pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="text-2xl font-bold text-[#8789C0] text-center">{t("habits")}</h1>

        {((activeTab === "habits" && !isAdding) ||
          (activeTab === "reminders" && !isAddingReminder && habits.length > 0)) && (
          <Button
            onClick={() => (activeTab === "habits" ? setIsAdding(true) : setIsAddingReminder(true))}
            className="bg-[#8789C0] hover:bg-[#8789C0]/90 w-10 h-10 p-0 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}

        {((activeTab === "habits" && isAdding) ||
          (activeTab === "reminders" && (isAddingReminder || habits.length === 0))) && (
          <div className="w-10 h-10 flex items-center justify-center"></div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mx-4">
        <button
          onClick={() => setActiveTab("habits")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "habits" ? "bg-white text-[#8789C0] shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Habitudes
        </button>
        <button
          onClick={() => setActiveTab("reminders")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "reminders"
              ? "bg-white text-[#8789C0] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Rappels
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="px-4">
        {activeTab === "habits" && renderHabitsTab()}
        {activeTab === "reminders" && renderRemindersTab()}
      </div>

      {/* Modal pour créer/modifier une habitude - Animation slide-up */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={handleCancel} />

          {/* Modal content */}
          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">{editingId ? t("editHabit") : t("newHabit")}</h2>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="w-8 h-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground text-sm font-medium">
                    {t("habitTitle")}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={t("habitExample")}
                    required
                    className="mt-2 bg-white border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm font-medium">{t("weeklyGoal")}</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{t("selectDaysDesc")}</p>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="text-center">
                        <div className={`font-medium text-xs mb-1 text-muted-foreground`}>{day.label}</div>
                        <button
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className="h-10 w-full flex items-center justify-center transition-colors rounded-md hover:bg-muted cursor-pointer"
                        >
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center transition-all duration-200"
                            style={{
                              backgroundColor: formData.targetDays.includes(day.value) ? formData.color : "#F3F4F6",
                            }}
                          >
                            {formData.targetDays.includes(day.value) && (
                              <div
                                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                                style={{ backgroundColor: "white" }}
                              />
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground text-sm font-medium">
                    {t("description")}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder={t("habitDescPlaceholder")}
                    rows={3}
                    className="mt-2 bg-white border-border text-foreground resize-none"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm font-medium mb-3 block">{t("habitColor")}</Label>
                  <div className="grid grid-cols-5 gap-2 py-0">
                    {colors.map((color) => {
                      const isSelected = formData.color === color.value
                      return (
                        <div key={color.value} className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                            className={`relative w-12 h-12 rounded-full border-3 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8789C0] focus:ring-offset-2 ${
                              isSelected
                                ? "border-white shadow-lg scale-110 ring-2 ring-[#8789C0] ring-offset-2"
                                : "border-white/30 hover:border-white/60"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                  <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                          
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Espace pour éviter que le contenu soit caché par les boutons */}
                <div className="h-20"></div>
              </div>
            </div>

            {/* Footer avec boutons - fixé en bas */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-white pb-20">
              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#8789C0] hover:bg-[#8789C0]/90 h-12 text-base font-medium"
                >
                  {editingId ? t("modify") : t("createHabit")}
                </Button>
                {editingId ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteHabit(editingId)
                      handleCancel()
                    }}
                    className="h-12 px-6"
                  >
                    {t("delete")}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleCancel} className="h-12 px-6 bg-transparent">
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour créer un rappel - Animation slide-up */}
      {isAddingReminder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={handleCancelReminder}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">
                {editingReminderId ? t("editReminder") : t("newReminder")}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCancelReminder} className="w-8 h-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <Label className="text-foreground text-sm font-medium">{t("habit")}</Label>
                  <Select
                    value={reminderForm.habitId}
                    onValueChange={(value) => setReminderForm((prev) => ({ ...prev, habitId: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white border-border">
                      <SelectValue placeholder={t("chooseHabit")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      {habits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground text-sm font-medium">{t("time")}</Label>
                  <Input
                    type="time"
                    value={reminderForm.time}
                    onChange={(e) => setReminderForm((prev) => ({ ...prev, time: e.target.value }))}
                    className="mt-2 bg-white border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm font-medium">{t("days")}</Label>
                  <div className="grid grid-cols-7 gap-2 mt-3">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="text-center">
                        <div className="font-medium text-xs mb-1 text-muted-foreground">{day.label}</div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDays = reminderForm.days.includes(day.value)
                              ? reminderForm.days.filter((d) => d !== day.value)
                              : [...reminderForm.days, day.value].sort()
                            setReminderForm((prev) => ({ ...prev, days: newDays }))
                          }}
                          className="h-10 w-full flex items-center justify-center transition-colors rounded-md hover:bg-muted cursor-pointer"
                        >
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center transition-all duration-200"
                            style={{
                              backgroundColor: reminderForm.days.includes(day.value) ? "#8789C0" : "#F3F4F6",
                            }}
                          >
                            {reminderForm.days.includes(day.value) && (
                              <div
                                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                                style={{ backgroundColor: "white" }}
                              />
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-foreground text-sm font-medium">{t("customMessage")}</Label>
                  <Input
                    value={reminderForm.message}
                    onChange={(e) => setReminderForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder={t("reminderPlaceholder")}
                    className="mt-2 bg-white border-border text-foreground"
                  />
                </div>

                {/* Espace pour éviter que le contenu soit caché par les boutons */}
                <div className="h-20"></div>
              </div>
            </div>

            {/* Footer avec boutons - fixé en bas */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-white pb-20">
              <div className="flex space-x-2">
                <Button
                  onClick={handleReminderSubmit}
                  className="flex-1 bg-[#8789C0] hover:bg-[#8789C0]/90 h-12 text-base font-medium"
                >
                  {editingReminderId ? t("modify") : t("createReminder")}
                </Button>
                {editingReminderId ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteReminder(editingReminderId)
                      handleCancelReminder()
                    }}
                    className="h-12 px-6"
                  >
                    {t("delete")}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleCancelReminder} className="h-12 px-6 bg-transparent">
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
