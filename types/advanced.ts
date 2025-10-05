export interface AdvancedSettings {
  theme: "light" | "dark" | "system"
  language: "fr" | "en" | "es" | "de" | "it"
  timezone: string
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  timeFormat: "12h" | "24h"
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  notifications: NotificationSettings
  privacy: PrivacySettings
  sync: SyncSettings
  appearance: AppearanceSettings
  accessibility: AccessibilitySettings
  performance: PerformanceSettings
}

export interface NotificationSettings {
  enabled: boolean
  dailyReminders: boolean
  weeklyReports: boolean
  achievementAlerts: boolean
  streakWarnings: boolean
  customReminders: CustomReminder[]
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  sound: boolean
  vibration: boolean
}

export interface CustomReminder {
  id: string
  title: string
  message: string
  time: string
  days: number[] // 0-6, Sunday to Saturday
  isActive: boolean
}

export interface PrivacySettings {
  dataCollection: boolean
  analytics: boolean
  crashReports: boolean
  shareProgress: boolean
  publicProfile: boolean
  dataExport: {
    autoExport: boolean
    frequency: "weekly" | "monthly"
  }
}

export interface SyncSettings {
  enabled: boolean
  autoSync: boolean
  syncFrequency: "realtime" | "hourly" | "daily"
  cloudProvider: "none" | "google" | "icloud" | "dropbox"
  conflictResolution: "local" | "remote" | "manual"
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  colorScheme: "default" | "blue" | "green" | "purple" | "orange"
  fontSize: "small" | "medium" | "large"
  compactMode: boolean
  animations: boolean
}

export interface AccessibilitySettings {
  highContrast: boolean
  reduceMotion: boolean
  screenReader: boolean
  largeText: boolean
  hapticFeedback: boolean
  voiceCommands: boolean
  keyboardNavigation: boolean
}

export interface PerformanceSettings {
  cacheSize: number // MB
  offlineMode: boolean
  backgroundSync: boolean
  imageQuality: "low" | "medium" | "high"
  animationQuality: "low" | "medium" | "high"
  dataUsage: "minimal" | "normal" | "unlimited"
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  joinDate: Date
  preferences: AdvancedSettings
  stats: {
    totalHabits: number
    completedToday: number
    currentStreak: number
    longestStreak: number
    totalCompletions: number
  }
}

export interface ExportData {
  version: string
  exportDate: Date
  habits: any[]
  completions: any[]
  notes: any[]
  settings: AdvancedSettings
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  condition: (data: any) => boolean
  unlocked: boolean
  unlockedAt?: Date
}

export interface UserLevel {
  habitId: string
  level: number
  xp: number
  xpToNext: number
}

export interface GamificationData {
  userLevels: UserLevel[]
  achievements: Achievement[]
  totalXP: number
  globalLevel: number
}
