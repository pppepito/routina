"use client"
import { X } from 'lucide-react'
import { Star, ExternalLink, MessageSquare, Mail, Share2, Trophy, Heart, Coffee, Database, TrendingUp } from 'lucide-react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings, BarChart3, Award, Flame, Target, Shield, FileText, ScrollText, ChevronRight } from 'lucide-react'
import { useSettings } from "../hooks/use-settings"
import { useHabits } from "../hooks/use-habits"
import { useNotes } from "../hooks/use-notes"
import { useTranslations } from "../hooks/use-translations"
import { DataBackup } from "./data-backup"

export function UserProfile() {
  const { settings, updateSetting, updateNestedSetting } = useSettings()
  const { habits, completions } = useHabits()
  const { notes } = useNotes()
  const { t } = useTranslations()
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Utilisateur",
    email: "user@example.com",
    bio: "Passionné par le développement personnel",
    location: "Paris, France",
  })

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)

  // Calculer les statistiques
  const totalHabits = habits.length
  const completedToday = habits.filter((habit) => {
    const today = new Date().toISOString().split("T")[0]
    return completions.some((c) => c.habitId === habit.id && c.date === today && c.status === "completed")
  }).length

  const totalCompletions = completions.filter((c) => c.status === "completed").length
  const currentStreak = Math.max(
    ...habits.map((habit) => {
      // Calculer la série actuelle pour chaque habitude
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

  // Calculer les statistiques avancées pour les nouveaux badges
  const totalNotes = notes.length
  const daysWithHabits = new Set(completions.map((c) => c.date)).size
  const perfectDays = completions.reduce((acc, completion) => {
    const date = completion.date
    const dayCompletions = completions.filter((c) => c.date === date && c.status === "completed")
    const dayHabits = habits.filter((h) => h.isActive).length
    if (dayCompletions.length === dayHabits && dayHabits > 0) {
      acc.add(date)
    }
    return acc
  }, new Set()).size

  // Calculer les badges (16 badges au total maintenant)
  const badges = []

  // Badges originaux (6)
  if (totalHabits > 0)
    badges.push({ name: t("firstStep"), icon: "🎯", description: t("firstStepDesc"), category: t("beginner") })
  if (currentStreak >= 7)
    badges.push({ name: t("oneWeek"), icon: "🔥", description: t("oneWeekDesc"), category: "Suite" })
  if (totalCompletions >= 50)
    badges.push({
      name: "Persévérant",
      icon: "💪",
      description: t("perseverantDesc"),
      category: "Accomplissement",
    })
  if (totalCompletions >= 100)
    badges.push({
      name: "Centenaire",
      icon: "💯",
      description: t("centenaryDesc"),
      category: "Accomplissement",
    })
  if (currentStreak >= 30)
    badges.push({ name: t("champion"), icon: "🏆", description: t("championDesc"), category: "Suite" })
  if (totalHabits >= 5)
    badges.push({ name: t("collector"), icon: "📚", description: t("collectorDesc"), category: t("collection") })

  // Nouveaux badges (10)
  if (currentStreak >= 14)
    badges.push({ name: t("twoWeeks"), icon: "🌟", description: t("twoWeeksDesc"), category: "Suite" })
  if (totalCompletions >= 200)
    badges.push({
      name: "Bicentenaire",
      icon: "🎖️",
      description: t("bicentenaryDesc"),
      category: "Accomplissement",
    })
  if (totalHabits >= 10)
    badges.push({
      name: t("habitMaster"),
      icon: "👑",
      description: t("habitMasterDesc"),
      category: t("collection"),
    })
  if (totalNotes >= 20)
    badges.push({ name: t("writer"), icon: "✍️", description: t("writerDesc"), category: t("reflection") })
  if (perfectDays >= 5)
    badges.push({
      name: t("perfectionist"),
      icon: "⭐",
      description: t("perfectionistDesc"),
      category: t("perfection"),
    })
  if (currentStreak >= 60)
    badges.push({ name: t("marathoner"), icon: "🏃", description: t("marathonerDesc"), category: "Suite" })
  if (totalCompletions >= 500)
    badges.push({
      name: t("legend"),
      icon: "🦄",
      description: t("legendDesc"),
      category: "Accomplissement",
    })
  if (daysWithHabits >= 30)
    badges.push({
      name: t("regular"),
      icon: "📅",
      description: t("regularDesc"),
      category: t("consistency"),
    })
  if (totalNotes >= 50)
    badges.push({
      name: t("philosopher"),
      icon: "🧠",
      description: t("philosopherDesc"),
      category: t("reflection"),
    })
  if (currentStreak >= 100)
    badges.push({ name: t("centurion"), icon: "⚔️", description: t("centurionDesc"), category: "Suite" })

  const handleRateApp = () => {
    // Détecter la plateforme et ouvrir le bon store
    const userAgent = navigator.userAgent || navigator.vendor

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS - App Store
      window.open("https://apps.apple.com/app/routina/id123456789", "_blank")
    } else if (/android/i.test(userAgent)) {
      // Android - Google Play Store
      window.open("https://play.google.com/store/apps/details?id=com.routina.app", "_blank")
    } else {
      // Web - demander de noter sur les stores
      alert("Merci ! Vous pouvez nous noter sur l'App Store (iOS) ou Google Play Store (Android)")
    }
  }

  const handleSendFeedback = () => {
    const subject = encodeURIComponent("Suggestion pour Routina")
    const body = encodeURIComponent(`Bonjour,

J'aimerais suggérer une amélioration pour l'application Routina :

[Votre suggestion ici]

Merci !

---
Version de l'app: 1.0
Navigateur: ${navigator.userAgent}`)

    window.open(`mailto:exceltonquotidien@gmail.com?subject=${subject}&body=${body}`, "_blank")
  }

  const handleShareApp = async () => {
    const shareData = {
      title: "Routina - Créez vos routines quotidiennes",
      text: "Découvrez Routina, l'app qui vous aide à créer et suivre vos routines quotidiennes !",
      url: window.location.origin,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareData.url)
          alert("Lien copié dans le presse-papiers !")
        } else {
          // Fallback ultime
          const textArea = document.createElement("textarea")
          textArea.value = shareData.url
          document.body.appendChild(textArea)
          textArea.select()
          try {
            document.execCommand("copy")
            alert("Lien copié dans le presse-papiers !")
          } catch (err) {
            prompt("Copiez ce lien pour partager l'app:", shareData.url)
          } finally {
            document.body.removeChild(textArea)
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error)
      // En cas d'erreur, proposer de copier le lien manuellement
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareData.url)
          alert("Lien copié dans le presse-papiers !")
        } else {
          prompt("Copiez ce lien pour partager l'app:", shareData.url)
        }
      } catch (clipboardError) {
        prompt("Copiez ce lien pour partager l'app:", shareData.url)
      }
    }
  }

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Avatar et informations principales */}
      <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}></Card>

      {/* Statistiques */}
      <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-[#8789C0]" />
            {t("statistics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{totalHabits}</div>
              <div className="text-sm text-muted-foreground">{t("habitsCreated")}</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{completedToday}</div>
              <div className="text-sm text-muted-foreground">{t("completedToday")}</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">{t("currentStreak")}</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{totalCompletions}</div>
              <div className="text-sm text-muted-foreground">{t("totalCompletions")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tous les badges - débloqués et bloqués */}
      <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center my-1.5 mb-4">
              <Trophy className="h-5 w-5 mr-2 text-[#8789C0]" />
              {t("badgeCollection")}
            </div>
            <div className="text-sm text-muted-foreground">
              {badges.length}/16 {t("unlocked")}
            </div>
          </CardTitle>
          {/* Résumé déplacé sous le titre */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 mt-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">Progression globale</h4>
                <p className="text-sm text-blue-600">{badges.length} badges débloqués sur 16 disponibles</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">{Math.round((badges.length / 16) * 100)}%</div>
                <div className="text-sm text-blue-600">Complété</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(badges.length / 16) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {/* Badge: Premier pas */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalHabits > 0
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalHabits > 0 ? "" : "grayscale"}`}>🎯</span>
                <span className={`font-medium text-sm ${totalHabits > 0 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("firstStep")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalHabits > 0 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("firstStepDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalHabits > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("beginner")}
              </div>
              {totalHabits > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              )}
            </div>

            {/* Badge: Une semaine */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                currentStreak >= 7
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${currentStreak >= 7 ? "" : "grayscale"}`}>🔥</span>
                <span className={`font-medium text-sm ${currentStreak >= 7 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("oneWeek")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${currentStreak >= 7 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("oneWeekDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentStreak >= 7 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Suite
              </div>
              {currentStreak >= 7 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {currentStreak}/7
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Deux semaines */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                currentStreak >= 14
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${currentStreak >= 14 ? "" : "grayscale"}`}>🌟</span>
                <span className={`font-medium text-sm ${currentStreak >= 14 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("twoWeeks")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${currentStreak >= 14 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("twoWeeksDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentStreak >= 14 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Suite
              </div>
              {currentStreak >= 14 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {Math.min(currentStreak, 14)}/14
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Champion (30 jours) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                currentStreak >= 30
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${currentStreak >= 30 ? "" : "grayscale"}`}>🏆</span>
                <span className={`font-medium text-sm ${currentStreak >= 30 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("champion")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${currentStreak >= 30 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("championDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentStreak >= 30 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Suite
              </div>
              {currentStreak >= 30 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {Math.min(currentStreak, 30)}/30
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Marathonien (60 jours) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                currentStreak >= 60
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${currentStreak >= 60 ? "" : "grayscale"}`}>🏃</span>
                <span className={`font-medium text-sm ${currentStreak >= 60 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("marathoner")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${currentStreak >= 60 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("marathonerDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentStreak >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Suite
              </div>
              {currentStreak >= 60 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {Math.min(currentStreak, 60)}/60
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Centurion (100 jours) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                currentStreak >= 100
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${currentStreak >= 100 ? "" : "grayscale"}`}>⚔️</span>
                <span className={`font-medium text-sm ${currentStreak >= 100 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("centurion")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${currentStreak >= 100 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("centurionDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentStreak >= 100 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Suite
              </div>
              {currentStreak >= 100 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {Math.min(currentStreak, 100)}/100
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Persévérant (50 complétions) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalCompletions >= 50
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalCompletions >= 50 ? "" : "grayscale"}`}>💪</span>
                <span className={`font-medium text-sm ${totalCompletions >= 50 ? "text-yellow-800" : "text-gray-600"}`}>
                  Persévérant
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalCompletions >= 50 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("perseverantDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalCompletions >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Accomplissement
              </div>
              {totalCompletions >= 50 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalCompletions}/50
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Centenaire (100 complétions) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalCompletions >= 100
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalCompletions >= 100 ? "" : "grayscale"}`}>💯</span>
                <span
                  className={`font-medium text-sm ${totalCompletions >= 100 ? "text-yellow-800" : "text-gray-600"}`}
                >
                  Centenaire
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalCompletions >= 100 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("centenaryDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalCompletions >= 100 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Accomplissement
              </div>
              {totalCompletions >= 100 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalCompletions}/100
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Bicentenaire (200 complétions) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalCompletions >= 200
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalCompletions >= 200 ? "" : "grayscale"}`}>🎖️</span>
                <span
                  className={`font-medium text-sm ${totalCompletions >= 200 ? "text-yellow-800" : "text-gray-600"}`}
                >
                  Bicentenaire
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalCompletions >= 200 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("bicentenaryDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalCompletions >= 200 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Accomplissement
              </div>
              {totalCompletions >= 200 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalCompletions}/200
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Légende (500 complétions) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalCompletions >= 500
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalCompletions >= 500 ? "" : "grayscale"}`}>🦄</span>
                <span
                  className={`font-medium text-sm ${totalCompletions >= 500 ? "text-yellow-800" : "text-gray-600"}`}
                >
                  {t("legend")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalCompletions >= 500 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("legendDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalCompletions >= 500 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                Accomplissement
              </div>
              {totalCompletions >= 500 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalCompletions}/500
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Collectionneur (5 habitudes) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalHabits >= 5
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalHabits >= 5 ? "" : "grayscale"}`}>📚</span>
                <span className={`font-medium text-sm ${totalHabits >= 5 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("collector")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalHabits >= 5 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("collectorDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalHabits >= 5 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("collection")}
              </div>
              {totalHabits >= 5 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalHabits}/5
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Maître des habitudes (10 habitudes) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalHabits >= 10
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalHabits >= 10 ? "" : "grayscale"}`}>👑</span>
                <span className={`font-medium text-sm ${totalHabits >= 10 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("habitMaster")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalHabits >= 10 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("habitMasterDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalHabits >= 10 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("collection")}
              </div>
              {totalHabits >= 10 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalHabits}/10
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Écrivain (20 notes) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalNotes >= 20
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalNotes >= 20 ? "" : "grayscale"}`}>✍️</span>
                <span className={`font-medium text-sm ${totalNotes >= 20 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("writer")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalNotes >= 20 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("writerDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalNotes >= 20 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("reflection")}
              </div>
              {totalNotes >= 20 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalNotes}/20
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Philosophe (50 notes) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                totalNotes >= 50
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${totalNotes >= 50 ? "" : "grayscale"}`}>🧠</span>
                <span className={`font-medium text-sm ${totalNotes >= 50 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("philosopher")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${totalNotes >= 50 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("philosopherDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  totalNotes >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("reflection")}
              </div>
              {totalNotes >= 50 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {totalNotes}/50
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Perfectionniste (5 jours parfaits) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                perfectDays >= 5
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${perfectDays >= 5 ? "" : "grayscale"}`}>⭐</span>
                <span className={`font-medium text-sm ${perfectDays >= 5 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("perfectionist")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${perfectDays >= 5 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("perfectionistDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  perfectDays >= 5 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("perfection")}
              </div>
              {perfectDays >= 5 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {perfectDays}/5
                  </span>
                </div>
              )}
            </div>

            {/* Badge: Régulier (30 jours actifs) */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                daysWithHabits >= 30
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${daysWithHabits >= 30 ? "" : "grayscale"}`}>📅</span>
                <span className={`font-medium text-sm ${daysWithHabits >= 30 ? "text-yellow-800" : "text-gray-600"}`}>
                  {t("regular")}
                </span>
              </div>
              <p className={`text-xs mb-1 ${daysWithHabits >= 30 ? "text-yellow-700" : "text-gray-500"}`}>
                {t("regularDesc")}
              </p>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  daysWithHabits >= 30 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t("consistency")}
              </div>
              {daysWithHabits >= 30 ? (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("unlocked")}</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">
                    {t("progress")}: {daysWithHabits}/30
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Support et communauté */}
      <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-[#8789C0]" />
            {t("supportCommunity")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleRateApp}>
            <Star className="h-4 w-4 mr-3 text-yellow-500" />
            {t("rateApp")}
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleSendFeedback}>
            <MessageSquare className="h-4 w-4 mr-3 text-blue-500" />
            {t("sendFeedback")}
            <Mail className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleShareApp}>
            <Share2 className="h-4 w-4 mr-3 text-green-500" />
            {t("shareApp")}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => window.open("https://ko-fi.com/routinapp", "_blank")}
          >
            <Coffee className="h-4 w-4 mr-3 text-orange-500" />
            {t("buyMeCoffee")}
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      {/* Sauvegarde et données */}
      <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-[#8789C0]" />
            Sauvegarde des données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataBackup />
        </CardContent>
      </Card>

      {/* Politique de confidentialité et conditions */}
      <Card className="bg-white border-0" style={{ boxShadow: "0 0 30px rgba(0, 0, 0, 0.05)" }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-[#8789C0]" />
            Informations légales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => setShowPrivacyPolicy(true)}
            >
              <FileText className="h-4 w-4 mr-3 text-blue-500" />
              Politique de confidentialitié
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => setShowTermsOfService(true)}
            >
              <ScrollText className="h-4 w-4 mr-3 text-green-500" />
              Conditions d'utilisation
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Button>
          </div>

          <div className="pt-4 border-t border-muted">
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Version de l'application : 1.0.0</p>
              <p>© 2025 Routina. Tous droits réservés.</p>
              <p className="text-xs">Dernière mise à jour des conditions : 30 juin 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen pt-safe pt-8" style={{ backgroundColor: "#F2F2F2", minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe" style={{ backgroundColor: "#F2F2F2" }}>
        <h1 className="text-2xl font-bold text-[#8789C0]">{t("profileTitle")}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const event = new CustomEvent("navigate", { detail: "tracker" })
            window.dispatchEvent(event)
          }}
          className="text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs - Style identique à la page des habitudes */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mx-4">
        {[
          { id: "profile", label: t("profile"), icon: User },
          { id: "settings", label: t("settingsTitle"), icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === id ? "bg-white text-[#8789C0] shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pb-24 mt-6">
        {activeTab === "profile" && renderProfile()}
        {activeTab === "settings" && renderSettings()}
      </div>

      {/* Modales */}
      {/* Modales avec ouverture par le bas */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-0 z-50">
          <div className="bg-white rounded-t-lg w-full max-w-md mx-4 max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-lg font-semibold">Politique de confidentialité</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPrivacyPolicy(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-sm pb-20" style={{ maxHeight: "calc(80vh - 80px)" }}>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">Dernière mise à jour : 30 juin 2025</p>
                <p className="text-blue-600 text-xs mt-1">
                  Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">1. Collecte des données</h3>
                <p className="text-gray-600 mb-2">
                  Routina collecte uniquement les données nécessaires au fonctionnement de l'application :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Vos habitudes personnalisées et leurs paramètres</li>
                  <li>Vos complétions et statistiques de progression</li>
                  <li>Vos notes et réflexions personnelles</li>
                  <li>Vos préférences d'interface et de notifications</li>
                  <li>Données techniques de base (version de l'app, type d'appareil)</li>
                </ul>
                <p className="text-gray-600 mt-2 font-medium">
                  ✅ Toutes ces données sont stockées localement sur votre appareil par défaut.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">2. Utilisation des données</h3>
                <p className="text-gray-600 mb-2">Vos données personnelles sont utilisées exclusivement pour :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Afficher vos habitudes et statistiques personnelles</li>
                  <li>Sauvegarder vos préférences et paramètres</li>
                  <li>Générer vos rapports de progression et badges</li>
                  <li>Envoyer des rappels locaux (si activés)</li>
                  <li>Améliorer l'expérience utilisateur de l'application</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">3. Partage des données</h3>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-2">
                  <p className="text-green-800 font-medium">🔒 Engagement de confidentialité</p>
                  <p className="text-green-700 text-sm">
                    Nous ne partageons, ne vendons, ni ne louons jamais vos données personnelles à des tiers.
                  </p>
                </div>
                <p className="text-gray-600">
                  Vos données restent privées et sous votre contrôle total. Aucune donnée personnelle n'est transmise à
                  des services tiers sans votre consentement explicite.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">4. Stockage et sécurité des données</h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800">📱 Stockage local</p>
                    <p className="text-gray-600 text-sm">
                      Par défaut, toutes vos données sont stockées localement sur votre appareil dans un format
                      sécurisé.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800">☁️ Synchronisation cloud (optionnelle)</p>
                    <p className="text-gray-600 text-sm">
                      Si vous activez la synchronisation, vos données sont chiffrées avec AES-256 avant d'être envoyées
                      vers nos serveurs sécurisés.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">5. Vos droits</h3>
                <p className="text-gray-600 mb-2">Conformément au RGPD, vous disposez des droits suivants :</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium">✓ Accès</span> - Consulter vos données
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium">✓ Rectification</span> - Modifier vos données
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium">✓ Suppression</span> - Effacer vos données
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium">✓ Portabilité</span> - Exporter vos données
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">6. Cookies et technologies de suivi</h3>
                <p className="text-gray-600">
                  L'application utilise uniquement le stockage local du navigateur pour sauvegarder vos préférences.
                  Aucun cookie de suivi publicitaire n'est utilisé. Nous respectons votre vie privée.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">7. Modifications de cette politique</h3>
                <p className="text-gray-600">
                  Nous nous réservons le droit de modifier cette politique. Les changements importants vous seront
                  notifiés via l'application. La date de dernière mise à jour est indiquée en haut de ce document.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-16">
                <h3 className="font-semibold mb-2 text-blue-800">📧 Contact</h3>
                <p className="text-blue-700 text-sm">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                </p>
                <p className="text-blue-800 font-medium mt-1">exceltonquotidien@gmail.com</p>
                <p className="text-blue-600 text-xs mt-2">Nous nous engageons à répondre dans les 72 heures.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTermsOfService && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-0 z-50">
          <div className="bg-white rounded-t-lg w-full max-w-md mx-4 max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-lg font-semibold">Conditions d'utilisation</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTermsOfService(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-sm pb-20" style={{ maxHeight: "calc(80vh - 80px)" }}>
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">Dernière mise à jour : 30 juin 2025</p>
                <p className="text-green-600 text-xs mt-1">Ces conditions régissent votre utilisation de Routina.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">1. Acceptation des conditions</h3>
                <p className="text-gray-600">
                  En téléchargeant, installant ou utilisant Routina, vous acceptez d'être lié par ces conditions
                  d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">2. Description du service</h3>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-2">
                  <p className="text-blue-800 font-medium">🎯 Routina</p>
                  <p className="text-blue-700 text-sm">
                    Application de suivi d'habitudes pour améliorer votre développement personnel
                  </p>
                </div>
                <p className="text-gray-600 mb-2">L'application fournit les fonctionnalités suivantes :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Création et personnalisation d'habitudes</li>
                  <li>Suivi quotidien de vos progrès</li>
                  <li>Statistiques et analyses détaillées</li>
                  <li>Système de badges et gamification</li>
                  <li>Rappels et notifications personnalisables</li>
                  <li>Prise de notes et réflexions</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">3. Utilisation acceptable</h3>
                <p className="text-gray-600 mb-2">
                  Vous vous engagez à utiliser l'application de manière légale et appropriée. Il est strictement
                  interdit de :
                </p>
                <div className="space-y-2">
                  <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <p className="text-red-800 text-sm">
                      ❌ Utiliser l'application à des fins illégales ou malveillantes
                    </p>
                  </div>
                  <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <p className="text-red-800 text-sm">❌ Tenter de pirater, compromettre ou contourner la sécurité</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <p className="text-red-800 text-sm">
                      ❌ Partager des contenus inappropriés, offensants ou illégaux
                    </p>
                  </div>
                  <div className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <p className="text-red-800 text-sm">
                      ❌ Utiliser l'application pour nuire à autrui ou violer la vie privée
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">4. Propriété intellectuelle</h3>
                <p className="text-gray-600 mb-2">
                  Routina, son code source, son design, ses contenus et tous les éléments associés sont protégés par les
                  droits d'auteur et autres droits de propriété intellectuelle.
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 font-medium">⚖️ Droits réservés</p>
                  <p className="text-yellow-700 text-sm">
                    Vous ne pouvez pas copier, modifier, distribuer, vendre ou créer des œuvres dérivées sans
                    autorisation écrite préalable.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">5. Disponibilité du service</h3>
                <p className="text-gray-600">
                  Nous nous efforçons de maintenir l'application disponible 24h/24, 7j/7, mais nous ne pouvons garantir
                  une disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mises à jour ou
                  raisons techniques.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">6. Limitation de responsabilité</h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-gray-800 font-medium mb-2">Clause de non-responsabilité</p>
                  <p className="text-gray-600 text-sm mb-2">
                    L'application est fournie "en l'état" et "selon disponibilité". Nous ne garantissons pas que
                    l'application sera :
                  </p>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                    <li>Exempte d'erreurs ou de bugs</li>
                    <li>Disponible en permanence sans interruption</li>
                    <li>Compatible avec tous les appareils ou systèmes</li>
                    <li>Adaptée à tous vos besoins spécifiques</li>
                  </ul>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  Nous ne sommes pas responsables des dommages directs, indirects, accessoires ou consécutifs résultant
                  de l'utilisation ou de l'impossibilité d'utiliser l'application.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">7. Modifications des conditions</h3>
                <p className="text-gray-600">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront
                  effectives dès leur publication sur l'application. Il est de votre responsabilité de consulter
                  régulièrement les conditions mises à jour.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">8. Résiliation</h3>
                <p className="text-gray-600">
                  Nous pouvons résilier votre accès à l'application à tout moment, sans préavis, en cas de violation de
                  ces conditions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">9. Droit applicable et juridiction</h3>
                <p className="text-gray-600">
                  Ces conditions sont régies par le droit français. Tout litige relatif à ces conditions sera soumis à
                  la compétence exclusive des tribunaux de Paris.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-16">
                <h3 className="font-semibold mb-2 text-green-800">📧 Contact</h3>
                <p className="text-green-700 text-sm">Pour toute question concernant ces conditions d'utilisation :</p>
                <p className="text-green-800 font-medium mt-1">exceltonquotidien@gmail.com</p>
                <p className="text-green-600 text-xs mt-2">Nous nous engageons à répondre dans les 72 heures.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
