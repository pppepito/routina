"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Calendar, Smile, X, Loader2 } from 'lucide-react'
import { useNotes } from "../hooks/use-notes"
import { useHabits } from "../hooks/use-habits"
import { useTranslations } from "../hooks/use-translations"

export function Notes() {
  const { notes, isLoading, addNote, updateNote, deleteNote, getNotesForDate, getRecentNotes } = useNotes()
  const { habits } = useHabits()
  const { t } = useTranslations()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    content: "",
    mood: "neutral" as const,
    habitId: undefined as string | undefined,
  })

  const moods = [
    { value: "great", icon: "😄", label: "Excellent", color: "bg-green-100 text-green-800" },
    { value: "good", icon: "😊", label: "Bien", color: "bg-blue-100 text-blue-800" },
    { value: "neutral", icon: "😐", label: "Neutre", color: "bg-gray-100 text-gray-800" },
    { value: "bad", icon: "😕", label: "Difficile", color: "bg-orange-100 text-orange-800" },
    { value: "terrible", icon: "😞", label: "Très difficile", color: "bg-red-100 text-red-800" },
  ] as const

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    if (editingId) {
      updateNote(editingId, {
        content: formData.content,
        mood: formData.mood,
        habitId: formData.habitId,
      })
      setEditingId(null)
    } else {
      addNote(formData.content, formData.habitId, formData.mood)
    }

    setIsAdding(false)
    setFormData({
      content: "",
      mood: "neutral",
      habitId: undefined,
    })
  }

  const handleEdit = (note: any) => {
    setFormData({
      content: note.content,
      mood: note.mood || "neutral",
      habitId: note.habitId,
    })
    setEditingId(note.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      content: "",
      mood: "neutral",
      habitId: undefined,
    })
  }

  // Replace the filteredNotes filtering logic with:
  const filteredNotes = notes.filter((note) => !note.goalId)

  const getMoodInfo = (mood: string) => {
    return moods.find((m) => m.value === mood) || moods[2] // default to neutral
  }

  // Composant de skeleton pour le chargement
  const NoteSkeleton = () => (
    <Card className="bg-white border-0 transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-8 h-8" />
          </div>
        </div>
        <div className="mb-2">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="border-t border-border pt-2">
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 min-h-screen pt-safe pt-8" style={{ backgroundColor: "#F2F2F2" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="text-2xl font-bold text-[#8789C0]">{t("notesTitle")}</h1>

        {!isAdding && !isLoading && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-[#8789C0] hover:bg-[#8789C0]/90 w-10 h-10 p-0 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}

        {(isAdding || isLoading) && (
          <div className="w-10 h-10 flex items-center justify-center">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-[#8789C0]" />}
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Liste des notes */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <>
                {filteredNotes.length} {filteredNotes.length !== 1 ? t("notesCountPlural") : t("notesCount")}
              </>
            )}
          </h2>

          {isLoading ? (
            // Afficher des skeletons pendant le chargement
            <>
              {[...Array(3)].map((_, index) => (
                <NoteSkeleton key={index} />
              ))}
            </>
          ) : (
            // Afficher les notes réelles
            <>
              {filteredNotes.map((note) => {
                const moodInfo = getMoodInfo(note.mood || "neutral")
                const linkedHabit = note.habitId ? habits.find((h) => h.id === note.habitId) : null

                return (
                  <Card key={note.id} className="bg-white border-0 transition-shadow">
                    <CardContent className="p-3">
                      {/* Header de la note avec mood, habitude et actions */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Mood emoji */}
                          <span className="text-xl flex-shrink-0">{moodInfo.icon}</span>

                          {/* Habitude liée si présente */}
                          {linkedHabit && (
                            <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-full min-w-0 max-w-[140px]">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: linkedHabit.color }}
                              />
                              <span className="text-xs font-medium text-foreground truncate">{linkedHabit.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions horizontales dans le header */}
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                            className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Contenu de la note */}
                      <div className="mb-2">
                        <p className="text-foreground leading-relaxed break-words overflow-wrap-anywhere text-sm">
                          {note.content}
                        </p>
                      </div>

                      {/* Footer avec la date - plus compact */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                  <Smile className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t("noNotesYet")}</h3>
                  <p className="text-muted-foreground mb-4">{t("startWritingReflections")}</p>
                  <Button onClick={() => setIsAdding(true)} className="bg-[#8789C0] hover:bg-[#8789C0]/90">
                    {t("writeFirstNote")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal pour créer/modifier une note - Animation slide-up */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={handleCancel} />

          {/* Modal content */}
          <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">{editingId ? t("editNote") : t("newNote")}</h2>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="w-8 h-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t("howDoYouFeel")}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {moods.map((mood) => (
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
                  <label className="text-sm font-medium text-foreground mb-2 block">{t("linkToHabit")}</label>
                  <Select
                    value={formData.habitId || "none"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        habitId: value === "none" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-white border-border text-left">
                      <div className="truncate">
                        <SelectValue placeholder="Choisir une habitude" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      <SelectItem value="none">{t("noHabit")}</SelectItem>
                      {habits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: habit.color }}
                            />
                            <span className="truncate">{habit.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t("yourNote")}</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder={t("whatHappenedToday")}
                    rows={4}
                    className="resize-none bg-white border-border text-foreground"
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
                  onClick={handleSubmit}
                  className="flex-1 bg-[#8789C0] hover:bg-[#8789C0]/90 h-12 text-base font-medium"
                >
                  {editingId ? t("modify") : t("createNote")}
                </Button>
                {editingId ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteNote(editingId)
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
    </div>
  )
}
