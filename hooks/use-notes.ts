"use client"

import { useState, useEffect } from "react"
import type { Note } from "../types/note"

// Variable globale pour tracker si les données ont déjà été chargées
let notesDataInitialized = false
let cachedNotes: Note[] = []

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(cachedNotes)
  const [isLoading, setIsLoading] = useState(!notesDataInitialized)

  // Initialiser les notes depuis le localStorage
  useEffect(() => {
    const loadData = async () => {
      // Si les données sont déjà initialisées, pas besoin de recharger
      if (notesDataInitialized) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Utiliser setTimeout pour éviter le blocage du thread principal
        await new Promise((resolve) => setTimeout(resolve, 0))

        const savedNotes = localStorage.getItem("notes")
        if (savedNotes) {
          try {
            const parsedNotes = JSON.parse(savedNotes)
            const notesWithDates = parsedNotes.map((note: any) => ({
              ...note,
              createdAt: new Date(note.createdAt),
            }))
            cachedNotes = notesWithDates
            setNotes(notesWithDates)
          } catch (error) {
            console.error("Error parsing saved notes:", error)
            cachedNotes = []
            setNotes([])
          }
        } else {
          cachedNotes = []
          setNotes([])
        }

        // Marquer les données comme initialisées
        notesDataInitialized = true
      } catch (error) {
        console.error("Error initializing notes:", error)
        cachedNotes = []
        setNotes([])
        notesDataInitialized = true // Même en cas d'erreur, éviter de recharger
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Sauvegarder les notes dans le localStorage à chaque changement
  useEffect(() => {
    if (!isLoading && notesDataInitialized) {
      try {
        localStorage.setItem("notes", JSON.stringify(notes))
        // Mettre à jour le cache
        cachedNotes = notes
      } catch (error) {
        console.error("Error saving notes to localStorage:", error)
      }
    }
  }, [notes, isLoading])

  const addNote = (content: string, habitId?: string, mood?: Note["mood"]) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
      habitId,
      mood,
    }
    setNotes((prev) => [newNote, ...prev])
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates } : note)))
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const getNotesForDate = (date: string) => {
    return notes.filter((note) => note.date === date)
  }

  const getNotesForHabit = (habitId: string) => {
    return notes.filter((note) => note.habitId === habitId)
  }

  const getRecentNotes = (limit = 10) => {
    return notes.slice(0, limit)
  }

  const getNotesForGoal = (goalId: string) => {
    return notes.filter((note) => note.goalId === goalId)
  }

  const addGoalNote = (content: string, goalId: string, mood?: Note["mood"]) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
      goalId,
      mood,
    }
    setNotes((prev) => [newNote, ...prev])
  }

  return {
    notes,
    isLoading, // Exposer l'état de chargement
    addNote,
    updateNote,
    deleteNote,
    getNotesForDate,
    getNotesForHabit,
    getRecentNotes,
    getNotesForGoal,
    addGoalNote,
  }
}
