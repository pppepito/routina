"use client"

import { useState, useEffect } from "react"

export interface Settings {
  theme: "light" | "dark" | "auto"
  language: "fr" | "en" | "es" | "de" | "it"
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  timeFormat: "12h" | "24h"
  notifications: {
    enabled: boolean
    sound: boolean
    vibration: boolean
    dailyReminder: boolean
    weeklyReport: boolean
    achievements: boolean
    reminderTime: string
  }
  display: {
    compactMode: boolean
    animationsEnabled: boolean
    showWeekNumbers: boolean
    startWeekOnMonday: boolean
  }
  privacy: {
    analytics: boolean
    crashReports: boolean
    dataSharing: boolean
  }
  backup: {
    autoBackup: boolean
    frequency: "daily" | "weekly" | "monthly"
    cloudSync: boolean
  }
  accessibility: {
    largeText: boolean
    highContrast: boolean
    reduceMotion: boolean
    screenReader: boolean
  }
}

const defaultSettings: Settings = {
  theme: "auto",
  language: "fr",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    reminderTime: "09:00",
  },
  display: {
    compactMode: false,
    animationsEnabled: true,
    showWeekNumbers: false,
    startWeekOnMonday: true,
  },
  privacy: {
    analytics: true,
    crashReports: true,
    dataSharing: false,
  },
  backup: {
    autoBackup: true,
    frequency: "weekly",
    cloudSync: false,
  },
  accessibility: {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("habit-tracker-settings")
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }, [])

  const saveSettings = (newSettings: Settings) => {
    try {
      localStorage.setItem("habit-tracker-settings", JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const updateNestedSetting = <K extends keyof Settings, NK extends keyof Settings[K]>(
    key: K,
    nestedKey: NK,
    value: Settings[K][NK],
  ) => {
    const newSettings = {
      ...settings,
      [key]: {
        ...settings[key],
        [nestedKey]: value,
      },
    }
    saveSettings(newSettings)
  }

  const resetSettings = () => {
    saveSettings(defaultSettings)
  }

  return {
    settings,
    updateSetting,
    updateNestedSetting,
    resetSettings,
  }
}
