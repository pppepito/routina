"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Calendar, Target, X, AlertTriangle, CheckCircle, Clock, TrendingUp, StickyNote, History, RotateCcw, Link, Check } from 'lucide-react'
import { useGoals } from "../hooks/use-goals"
import { useHabits } from "../hooks/use-habits"
import { useTranslations } from "../hooks/use-translations"

export function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, updateProgress, getActiveGoals, getCompletedGoals, getGoalProgress } =
    useGoals()
  const { habits } = useHabits()
  const { t } = useTranslations()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<"active" | "completed">("active")
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null)
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null)
  const [newNote, setNewNote] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState("")
  const [editingNoteMood, setEditingNoteMood] = useState("neutral")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    category: "personal" as const,
    priority: "medium" as const,
    linkedHabits: [] as string[],
    notes: [] as Array<{ id: string; text: string; date: string; mood: string }>,
    mood: "neutral" as const,
  })

  const moodOptions = [
    { value: "great", icon: "😄", label: "Excellent" },
    { value: "good", icon: "😊", label: "Bien" },
    { value: "neutral", icon: "😐", label: "Neutre" },
    { value: "bad", icon: "😕", label: "Difficile" },
    { value: "terrible", icon: "😞", label: "Très difficile" },
  ]

  const categories = [
    { value: "health", label: "Santé", color: "bg-green-100 text-green-800", icon: "💪" },
    { value: "fitness", label: "Fitness", color: "bg-emerald-100 text-emerald-800", icon: "🏃‍♂️" },
    { value: "nutrition", label: "Nutrition", color: "bg-lime-100 text-lime-800", icon: "🥗" },
    { value: "productivity", label: "Productivité", color: "bg-blue-100 text-blue-800", icon: "⚡" },
    { value: "work", label: "Travail", color: "bg-indigo-100 text-indigo-800", icon: "💼" },
    { value: "learning", label: "Apprentissage", color: "bg-purple-100 text-purple-800", icon: "📚" },
    { value: "skills", label: "Compétences", color: "bg-violet-100 text-violet-800", icon: "🎯" },
    { value: "personal", label: "Personnel", color: "bg-orange-100 text-orange-800", icon: "🌟" },
    { value: "family", label: "Famille", color: "bg-pink-100 text-pink-800", icon: "👨‍👩‍👧‍👦" },
    { value: "social", label: "Social", color: "bg-rose-100 text-rose-800", icon: "👥" },
    { value: "finance", label: "Finance", color: "bg-yellow-100 text-yellow-800", icon: "💰" },
    { value: "travel", label: "Voyage", color: "bg-cyan-100 text-cyan-800", icon: "✈️" },
    { value: "hobby", label: "Loisirs", color: "bg-teal-100 text-teal-800", icon: "🎨" },
    { value: "spiritual", label: "Spirituel", color: "bg-amber-100 text-amber-800", icon: "🧘‍♀️" },
    { value: "other", label: "Autre", color: "bg-gray-100 text-gray-800", icon: "📋" },
  ] as const

  const priorities = [
    { value: "low", label: "Basse", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "Haute", color: "bg-red-100 text-red-800" },
  ] as const

  const getMoodIcon = (mood: string) => {
    const moodOption = moodOptions.find((m) => m.value === mood)
    return moodOption ? moodOption.icon : "😐"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const goalData = {
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline,
      category: formData.category,
      priority: formData.priority,
      linkedHabits: formData.linkedHabits,
      notes: formData.notes,
    }

    if (editingId) {
      updateGoal(editingId, goalData)
      setEditingId(null)
    } else {
      addGoal({
        ...goalData,
        targetValue: 1,
        unit: "",
        milestones: [],
      })
    }

    setIsAdding(false)
    setFormData({
      title: "",
      description: "",
      deadline: "",
      category: "personal",
      priority: "medium",
      linkedHabits: [],
      notes: [],
      mood: "neutral",
    })
  }

  const handleEdit = (goal: any) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
      linkedHabits: goal.linkedHabits || [],
      notes: goal.notes || [],
      mood: "neutral",
    })
    setEditingId(goal.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      title: "",
      description: "",
      deadline: "",
      category: "personal",
      priority: "medium",
      linkedHabits: [],
      notes: [],
      mood: "neutral",
    })
  }

  const handleCompleteGoal = (goalId: string) => {
    updateGoal(goalId, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
    })
  }

  const handleUncompleteGoal = (goalId: string) => {
    updateGoal(goalId, {
      isCompleted: false,
      completedAt: undefined,
    })
  }

  const handleAddNote = (goalId: string) => {
    if (!newNote.trim()) return

    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const updatedNotes = [
      ...(goal.notes || []),
      {
        id: Date.now().toString(),
        text: newNote,
        date: new Date().toISOString(),
        mood: formData.mood,
      },
    ]

    updateGoal(goalId, { notes: updatedNotes })
    setNewNote("")
    setFormData((prev) => ({ ...prev, mood: "neutral" }))
    setShowNotesFor(null)
  }

  const handleCancelNote = () => {
    setShowNotesFor(null)
    setNewNote("")
    setFormData((prev) => ({ ...prev, mood: "neutral" }))
  }

  const handleEditNote = (goalId: string, noteId: string, currentText: string, currentMood: string) => {
    setEditingNoteId(noteId)
    setEditingNoteText(currentText)
    setEditingNoteMood(currentMood || "neutral")
    setShowHistoryFor(goalId)
  }

  const handleUpdateNote = (goalId: string, noteId: string) => {
    if (!editingNoteText.trim()) return

    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const updatedNotes = (goal.notes || []).map((note) =>
      note.id === noteId ? { ...note, text: editingNoteText, mood: editingNoteMood } : note,
    )

    updateGoal(goalId, { notes: updatedNotes })
    setEditingNoteId(null)
    setEditingNoteText("")
    setEditingNoteMood("neutral")
  }

  const handleCancelEditNote = () => {
    setEditingNoteId(null)
    setEditingNoteText("")
    setEditingNoteMood("neutral")
  }

  const handleDeleteNote = (goalId: string, noteId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const updatedNotes = (goal.notes || []).filter((note) => note.id !== noteId)
    updateGoal(goalId, { notes: updatedNotes })
  }

  const getCategoryInfo = (category: string) => {
    return categories.find((c) => c.value === category) || categories[7]
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find((p) => p.value === priority) || priorities[1]
  }

  const isGoalOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && deadline !== ""
  }

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTimeProgress = (createdAt: string, deadline: string) => {
    if (!deadline) return 0
    const created = new Date(createdAt)
    const deadline_date = new Date(deadline)
    const now = new Date()

    const totalTime = deadline_date.getTime() - created.getTime()
    const elapsedTime = now.getTime() - created.getTime()

    if (totalTime <= 0) return 100
    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100)
  }

  const activeGoals = getActiveGoals()
  const completedGoals = getCompletedGoals()
  const displayGoals = currentTab === "active" ? activeGoals : completedGoals

  // Statistiques
  const totalGoals = goals.length
  const completedCount = completedGoals.length
  const overdue = activeGoals.filter((goal) => isGoalOverdue(goal.deadline)).length
  const avgProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((acc, goal) => acc + getTimeProgress(goal.createdAt, goal.deadline), 0) /
            activeGoals.length,
        )
      : 0

  const GoalSkeleton = () => (
    <Card className="bg-white border-0 transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-8 h-8" />
          </div>
        </div>
        <Skeleton className="h-2 w-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 min-h-screen pt-safe pt-8" style={{ backgroundColor: "#F2F2F2" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="text-2xl font-bold text-[#8789C0]">Objectifs</h1>

        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-[#8789C0] hover:bg-[#8789C0]/90 w-10 h-10 p-0 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Statistiques */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2 bg-muted/20 rounded-lg p-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-3 w-3 text-blue-500" />
            </div>
            <div className="text-base font-bold text-foreground">{totalGoals}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>
            <div className="text-base font-bold text-foreground">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Terminés</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
            </div>
            <div className="text-base font-bold text-foreground">{overdue}</div>
            <div className="text-xs text-muted-foreground">En retard</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-3 w-3 text-purple-500" />
            </div>
            <div className="text-base font-bold text-foreground">{avgProgress}%</div>
            <div className="text-xs text-muted-foreground">Progrès</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-4">
          <button
            onClick={() => setCurrentTab("active")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentTab === "active"
                ? "bg-white text-[#8789C0] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setCurrentTab("completed")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentTab === "completed"
                ? "bg-white text-[#8789C0] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Terminés
          </button>
        </div>
      </div>

      {/* Liste des objectifs */}
      <div className="px-4 space-y-3 pb-24">
        {displayGoals.map((goal) => {
          const categoryInfo = getCategoryInfo(goal.category)
          const priorityInfo = getPriorityInfo(goal.priority)
          const timeProgress = getTimeProgress(goal.createdAt, goal.deadline)
          const daysLeft = getDaysUntilDeadline(goal.deadline)
          const isOverdue = isGoalOverdue(goal.deadline)
          const linkedHabitsList = (goal.linkedHabits || [])
            .map((habitId) => habits.find((h) => h.id === habitId))
            .filter(Boolean)

          return (
            <Card key={goal.id} className="bg-white border-0 transition-shadow">
              <CardContent className="p-4">
                {/* Header avec catégorie, priorité et actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icône de catégorie */}
                    <div className="text-2xl flex-shrink-0">{categoryInfo.icon}</div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate mb-1">{goal.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                        {goal.isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotesFor(showNotesFor === goal.id ? null : goal.id)}
                      className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <StickyNote className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistoryFor(showHistoryFor === goal.id ? null : goal.id)}
                      className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <History className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                      className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description si présente - avec word-break pour éviter le débordement */}
                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed break-words">{goal.description}</p>
                )}

                {/* Habitudes liées */}
                {linkedHabitsList.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-2">
                      <Link className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Habitudes liées:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {linkedHabitsList.map((habit) => (
                        <Badge key={habit.id} variant="outline" className="text-xs">
                          {habit.icon} {habit.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Barre de progression temporelle (verte) */}
                {goal.deadline && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Progression temporelle</span>
                      <span className="text-sm font-medium text-green-600">{Math.round(timeProgress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500 bg-green-500"
                        style={{ width: `${Math.min(timeProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions pour objectifs actifs - bouton plus petit */}
                {!goal.isCompleted && (
                  <div className="flex justify-end mb-3">
                    <Button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 h-8 text-sm"
                      size="sm"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Terminé
                    </Button>
                  </div>
                )}

                {/* Actions pour objectifs terminés */}
                {goal.isCompleted && (
                  <div className="flex justify-end mb-3">
                    <Button
                      onClick={() => handleUncompleteGoal(goal.id)}
                      variant="outline"
                      className="px-3 py-1 h-8 text-sm"
                      size="sm"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reprendre
                    </Button>
                  </div>
                )}

                {/* Footer avec date et statut */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-4">
                    {goal.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>
                          {new Date(goal.deadline).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    {goal.isCompleted && goal.completedAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Terminé le {new Date(goal.completedAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                  </div>

                  {/* Indicateur de temps restant */}
                  {!goal.isCompleted && daysLeft !== null && (
                    <div
                      className={`flex items-center gap-1 ${
                        isOverdue ? "text-red-600" : daysLeft <= 7 ? "text-orange-600" : "text-muted-foreground"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>
                        {isOverdue
                          ? `${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? "s" : ""} de retard`
                          : daysLeft === 0
                            ? "Aujourd'hui"
                            : `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Message si aucun objectif */}
        {displayGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {currentTab === "active" ? "Aucun objectif actif" : "Aucun objectif terminé"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentTab === "active"
                ? "Créez votre premier objectif pour commencer"
                : "Les objectifs terminés apparaîtront ici"}
            </p>
            {currentTab === "active" && (
              <Button onClick={() => setIsAdding(true)} className="bg-[#8789C0] hover:bg-[#8789C0]/90">
                Créer un objectif
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal pour créer/modifier un objectif */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={handleCancel} />

          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Modifier l'objectif" : "Nouvel objectif"}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="w-8 h-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Titre *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Perdre 5kg, Lire 12 livres..."
                    className="bg-white border-border"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre objectif en détail..."
                    rows={3}
                    className="resize-none bg-white border-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Date limite</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="bg-white border-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Catégorie</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border max-h-60">
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Priorité</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Habitudes liées</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-border rounded-md p-2">
                    {habits.length > 0 ? (
                      habits.map((habit) => (
                        <div key={habit.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`habit-${habit.id}`}
                            checked={formData.linkedHabits.includes(habit.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  linkedHabits: [...prev.linkedHabits, habit.id],
                                }))
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  linkedHabits: prev.linkedHabits.filter((id) => id !== habit.id),
                                }))
                              }
                            }}
                            className="data-[state=checked]:bg-[#8789C0] data-[state=checked]:border-[#8789C0]"
                          />
                          <label htmlFor={`habit-${habit.id}`} className="text-sm flex items-center gap-2">
                            <span>{habit.icon}</span>
                            <span>{habit.name}</span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune habitude disponible</p>
                    )}
                  </div>
                </div>

                <div className="h-20"></div>
              </form>
            </div>

            {/* Footer avec boutons */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-white pb-20">
              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#8789C0] hover:bg-[#8789C0]/90 h-12 text-base font-medium"
                >
                  {editingId ? "Modifier" : "Créer l'objectif"}
                </Button>
                {editingId ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteGoal(editingId)
                      handleCancel()
                    }}
                    className="h-12 px-6"
                  >
                    Supprimer
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleCancel} className="h-12 px-6 bg-transparent">
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter une note - même style que la page Notes */}
      {showNotesFor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={handleCancelNote} />

          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Nouvelle note</h2>
              <Button variant="ghost" size="sm" onClick={handleCancelNote} className="w-8 h-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Comment vous sentez-vous ?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, mood: mood.value }))}
                        className={`aspect-square flex items-center justify-center p-2 rounded-lg border-2 transition-all ${
                          formData.mood === mood.value
                            ? "border-[#8789C0] bg-[#8789C0]/10 scale-105"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        title={mood.label}
                      >
                        <span className="text-2xl">{mood.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Votre note</label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Qu'est-ce qui s'est passé aujourd'hui ?"
                    rows={4}
                    className="resize-none bg-white border-border text-foreground"
                  />
                </div>

                <div className="h-20"></div>
              </div>
            </div>

            {/* Footer avec boutons */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-white pb-20">
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAddNote(showNotesFor)}
                  className="flex-1 bg-[#8789C0] hover:bg-[#8789C0]/90 h-12 text-base font-medium"
                >
                  Créer la note
                </Button>
                <Button variant="outline" onClick={handleCancelNote} className="h-12 px-6 bg-transparent">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour l'historique des notes - avec édition et smiley */}
      {showHistoryFor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setShowHistoryFor(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Historique des notes</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowHistoryFor(null)} className="w-8 h-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {(() => {
                  const goal = goals.find((g) => g.id === showHistoryFor)
                  return goal && goal.notes && goal.notes.length > 0 ? (
                    <div className="space-y-3">
                      {goal.notes
                        .slice()
                        .reverse()
                        .map((note) => (
                          <div key={note.id} className="bg-purple-50 p-3 rounded-lg">
                            {editingNoteId === note.id ? (
                              <div className="space-y-3">
                                {/* Sélecteur d'humeur en mode édition */}
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-2 block">Humeur</label>
                                  <div className="grid grid-cols-5 gap-2">
                                    {moodOptions.map((mood) => (
                                      <button
                                        key={mood.value}
                                        type="button"
                                        onClick={() => setEditingNoteMood(mood.value)}
                                        className={`aspect-square flex items-center justify-center p-1 rounded-lg border-2 transition-all ${
                                          editingNoteMood === mood.value
                                            ? "border-[#8789C0] bg-[#8789C0]/10 scale-105"
                                            : "border-border hover:border-muted-foreground"
                                        }`}
                                        title={mood.label}
                                      >
                                        <span className="text-lg">{mood.icon}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <Textarea
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="resize-none bg-white border-border text-foreground"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateNote(showHistoryFor, note.id)}
                                    className="bg-[#8789C0] hover:bg-[#8789C0]/90 text-white px-3 py-1 h-8 text-sm"
                                  >
                                    Sauvegarder
                                  </Button>
                                  <Button
                                    onClick={handleCancelEditNote}
                                    variant="outline"
                                    className="px-3 py-1 h-8 text-sm bg-transparent"
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="text-lg flex-shrink-0">{getMoodIcon(note.mood)}</span>
                                    <p className="text-foreground text-sm leading-relaxed break-words">{note.text}</p>
                                  </div>
                                  <div className="flex gap-1 ml-2 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditNote(showHistoryFor, note.id, note.text, note.mood)}
                                      className="w-6 h-6 p-0 hover:bg-blue-50"
                                    >
                                      <Edit className="h-3 w-3 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteNote(showHistoryFor, note.id)}
                                      className="w-6 h-6 p-0 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(note.date).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Aucune note pour cet objectif</p>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-white pb-20">
              <Button variant="outline" onClick={() => setShowHistoryFor(null)} className="w-full h-12 bg-transparent">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
