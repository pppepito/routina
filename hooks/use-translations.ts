"use client"

import { useSettings } from "./use-settings"

export interface Translations {
  // Navigation
  habits: string
  tracker: string
  notes: string
  analytics: string
  profile: string
  settings: string

  // Profile page
  profileTitle: string
  settingsTitle: string
  statistics: string
  badgeCollection: string
  unlockedBadges: string
  globalProgress: string
  completed: string
  habitsCreated: string
  completedToday: string
  currentStreak: string
  totalCompletions: string
  memberSince: string
  unlocked: string
  progress: string

  // Badges
  firstStep: string
  firstStepDesc: string
  oneWeek: string
  oneWeekDesc: string
  twoWeeks: string
  twoWeeksDesc: string
  champion: string
  championDesc: string
  marathoner: string
  marathonerDesc: string
  centurion: string
  centurionDesc: string
  perseverant: string
  perseverantDesc: string
  centenary: string
  centenaryDesc: string
  bicentenary: string
  bicentenaryDesc: string
  legend: string
  legendDesc: string
  collector: string
  collectorDesc: string
  habitMaster: string
  habitMasterDesc: string
  writer: string
  writerDesc: string
  philosopher: string
  philosopherDesc: string
  perfectionist: string
  perfectionistDesc: string
  regular: string
  regularDesc: string

  // Badge categories
  beginner: string
  series: string
  achievement: string
  collection: string
  reflection: string
  perfection: string
  consistency: string

  // Settings
  language: string
  languageDesc: string
  appearance: string
  theme: string
  themeDesc: string
  light: string
  dark: string
  auto: string
  compactMode: string
  compactModeDesc: string
  animations: string
  animationsDesc: string
  supportCommunity: string
  rateApp: string
  sendFeedback: string
  shareApp: string
  buyMeCoffee: string

  // Habit tracker
  tracking: string
  progressPercent: string
  completedHabits: string
  record: string
  activeHabits: string
  noHabitsConfigured: string
  createFirstHabit: string
  goalTarget: string
  daysLabel: string
  createdOn: string
  quickNote: string
  noteFor: string
  reached: string

  // Habit settings
  myHabits: string
  reminders: string
  newHabit: string
  editHabit: string
  habitTitle: string
  weeklyGoal: string
  selectDaysDesc: string
  description: string
  habitColor: string
  createHabit: string
  modify: string
  cancel: string
  delete: string
  newReminder: string
  editReminder: string
  habit: string
  chooseHabit: string
  time: string
  days: string
  customMessage: string
  createReminder: string
  noHabitsMessage: string
  noRemindersMessage: string
  createFirstReminder: string
  habitExample: string
  habitDescPlaceholder: string
  reminderPlaceholder: string
  myReminders: string
  reminderFor: string
  active: string
  inactive: string
  reminder: string
  reminders_plural: string
  createRemindersFirst: string

  // Notes
  notesTitle: string
  newNote: string
  editNote: string
  howDoYouFeel: string
  linkToHabit: string
  noHabit: string
  yourNote: string
  createNote: string
  noNotesYet: string
  writeFirstNote: string
  startWritingReflections: string
  notesCount: string
  notesCountPlural: string

  // Analytics
  analysesTitle: string
  allHabits: string
  period: string
  days7: string
  month1: string
  months3: string
  months6: string
  year1: string
  emotionalWellbeing: string
  averageMood: string
  positiveMoods: string
  notesWithMood: string
  noMoodData: string
  startWritingNotes: string
  performanceEvolution: string
  success: string
  failures: string
  notRealized: string
  performanceByHabit: string
  trends: string
  mostRegularHabit: string
  notesInPeriod: string
  globalProgression: string
  excellent: string
  good: string
  toImprove: string
  tipOfDay: string
  excellentWork: string
  onRightTrack: string
  startSmall: string
  thisMonth: string
  noActiveHabits: string
  completions: string
  perfectDays: string
  successRate: string
  trackedHabits: string
  currentWeek: string
  onPeriod: string

  // Common
  save: string
  edit: string
  back: string
  close: string
  confirm: string
  loading: string
  error: string
  success: string
  warning: string
  info: string

  // Days of week
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string

  // Day abbreviations
  mon: string
  tue: string
  wed: string
  thu: string
  fri: string
  sat: string
  sun: string

  // Months
  january: string
  february: string
  march: string
  april: string
  may: string
  june: string
  july: string
  august: string
  september: string
  october: string
  november: string
  december: string

  // Calendar
  calendar: string
  today: string
  thisWeek: string
  backToThisWeek: string
}

const translations: Record<string, Translations> = {
  fr: {
    // Navigation
    habits: "Habitudes",
    tracker: "Suivi",
    notes: "Notes",
    analytics: "Analyses",
    profile: "Profil",
    settings: "Paramètres",

    // Profile page
    profileTitle: "Profil",
    settingsTitle: "Paramètres",
    statistics: "Statistiques",
    badgeCollection: "Collection de badges",
    unlockedBadges: "débloqués",
    globalProgress: "Progression globale",
    completed: "Complété",
    habitsCreated: "Habitudes créées",
    completedToday: "Complétées aujourd'hui",
    currentStreak: "Série actuelle",
    totalCompletions: "Total complétions",
    memberSince: "Membre depuis janvier 2024",
    unlocked: "Débloqué",
    progress: "Progrès",

    // Badges
    firstStep: "Premier pas",
    firstStepDesc: "Première habitude créée",
    oneWeek: "Une semaine",
    oneWeekDesc: "7 jours consécutifs",
    twoWeeks: "Deux semaines",
    twoWeeksDesc: "14 jours consécutifs",
    champion: "Champion",
    championDesc: "30 jours consécutifs",
    marathoner: "Marathonien",
    marathonerDesc: "60 jours consécutifs",
    centurion: "Centurion",
    centurionDesc: "100 jours consécutifs",
    perseverant: "Persévérant",
    perseverantDesc: "50 complétions",
    centenary: "Centenaire",
    centenaryDesc: "100 complétions",
    bicentenary: "Bicentenaire",
    bicentenaryDesc: "200 complétions",
    legend: "Légende",
    legendDesc: "500 complétions",
    collector: "Collectionneur",
    collectorDesc: "5 habitudes créées",
    habitMaster: "Maître des habitudes",
    habitMasterDesc: "10 habitudes créées",
    writer: "Écrivain",
    writerDesc: "20 notes rédigées",
    philosopher: "Philosophe",
    philosopherDesc: "50 notes de réflexion",
    perfectionist: "Perfectionniste",
    perfectionistDesc: "5 jours parfaits",
    regular: "Régulier",
    regularDesc: "Actif 30 jours différents",

    // Badge categories
    beginner: "Débutant",
    series: "Série",
    achievement: "Accomplissement",
    collection: "Collection",
    reflection: "Réflexion",
    perfection: "Perfection",
    consistency: "Consistance",

    // Settings
    language: "Langue de l'interface",
    languageDesc: "Choisir la langue de l'application",
    appearance: "Apparence",
    theme: "Thème",
    themeDesc: "Choisir le thème de l'application",
    light: "Clair",
    dark: "Sombre",
    auto: "Auto",
    compactMode: "Mode compact",
    compactModeDesc: "Interface plus dense",
    animations: "Animations",
    animationsDesc: "Activer les animations",
    supportCommunity: "Support et communauté",
    rateApp: "Noter l'application",
    sendFeedback: "Envoyer vos suggestions",
    shareApp: "Partager l'application",
    buyMeCoffee: "Offrir un café",

    // Habit tracker
    tracking: "Suivi",
    progressPercent: "Progrès",
    completedHabits: "Complétées",
    record: "Record",
    activeHabits: "Habitudes",
    noHabitsConfigured: "Aucune habitude configurée",
    createFirstHabit: "Créer ma première habitude",
    goalTarget: "Objectif",
    daysLabel: "jours",
    createdOn: "Créée le",
    quickNote: "Note rapide",
    noteFor: "Note pour",
    howDoYouFeel: "Comment vous sentez-vous ?",
    yourNote: "Votre note",
    whatHappenedToday: "Qu'est-ce qui s'est passé aujourd'hui ?",
    createNote: "Créer la note",
    cancel: "Annuler",
    reached: "Atteint!",

    // Habit settings
    myHabits: "Mes habitudes",
    reminders: "Rappels",
    newHabit: "Nouvelle habitude",
    editHabit: "Modifier l'habitude",
    habitTitle: "Titre de l'habitude",
    weeklyGoal: "Objectif hebdomadaire",
    selectDaysDesc: "Sélectionnez les jours où vous voulez pratiquer cette habitude",
    description: "Description",
    habitColor: "Couleur de l'habitude",
    createHabit: "Créer l'habitude",
    modify: "Modifier",
    delete: "Supprimer",
    newReminder: "Nouveau rappel",
    editReminder: "Modifier le rappel",
    habit: "Habitude",
    chooseHabit: "Choisir une habitude",
    time: "Heure",
    days: "Jours",
    customMessage: "Message personnalisé",
    createReminder: "Créer le rappel",
    noHabitsMessage: "Aucune habitude configurée",
    noRemindersMessage: "Aucun rappel configuré",
    createFirstReminder: "Créer mon premier rappel",
    habitExample: "Ex: Lire 10 pages, Faire du sport...",
    habitDescPlaceholder: "Pourquoi cette habitude est importante pour vous...",
    reminderPlaceholder: "Il est temps pour votre habitude !",
    myReminders: "Mes rappels",
    reminderFor: "Rappel pour",
    active: "Actif",
    inactive: "Inactif",
    reminder: "rappel",
    reminders_plural: "rappels",
    createRemindersFirst: "Vous devez d'abord créer des habitudes pour pouvoir configurer des rappels",

    // Notes
    notesTitle: "Notes",
    newNote: "Nouvelle note",
    editNote: "Modifier la note",
    linkToHabit: "Lier à une habitude (optionnel)",
    noHabit: "Aucune habitude",
    noNotesYet: "Aucune note pour le moment",
    writeFirstNote: "Écrire ma première note",
    startWritingReflections: "Commencez à écrire vos réflexions et suivez votre progression",
    notesCount: "note",
    notesCountPlural: "notes",

    // Analytics
    analysesTitle: "Analyses",
    allHabits: "Toutes les habitudes",
    period: "Période",
    days7: "7 jours",
    month1: "1 mois",
    months3: "3 mois",
    months6: "6 mois",
    year1: "1 an",
    emotionalWellbeing: "Bien-être émotionnel",
    averageMood: "Humeur moyenne",
    positiveMoods: "Humeurs positives",
    notesWithMood: "Notes avec humeur",
    noMoodData: "Aucune donnée d'humeur",
    startWritingNotes: "Commencez à écrire des notes avec votre humeur pour suivre votre bien-être émotionnel",
    performanceEvolution: "Évolution des performances",
    success: "Succès",
    failures: "Échecs",
    notRealized: "Non réalisés",
    performanceByHabit: "Performance par habitude",
    trends: "Tendances",
    mostRegularHabit: "Habitude la plus régulière",
    notesInPeriod: "Notes sur la période",
    globalProgression: "Progression globale",
    excellent: "Excellent",
    good: "Bien",
    toImprove: "À améliorer",
    tipOfDay: "💡 Conseil du jour",
    excellentWork: "Excellent travail ! Votre constance est remarquable. Continuez sur cette lancée !",
    onRightTrack: "Vous êtes sur la bonne voie ! Essayez de vous concentrer sur une habitude à la fois.",
    startSmall: "Commencez petit ! Choisissez une seule habitude et concentrez-vous dessus pendant une semaine.",
    thisMonth: "ce mois",
    noActiveHabits: "Aucune habitude active à suivre",
    completions: "Complétions",
    perfectDays: "Jours parfaits",
    successRate: "Taux de réussite",
    trackedHabits: "Habitudes suivies",
    currentWeek: "Semaine actuelle",
    onPeriod: "Sur la période",

    // Common
    save: "Sauvegarder",
    edit: "Modifier",
    back: "Retour",
    close: "Fermer",
    confirm: "Confirmer",
    loading: "Chargement...",
    error: "Erreur",
    warning: "Attention",
    info: "Information",

    // Days of week
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",

    // Day abbreviations
    mon: "L",
    tue: "Ma",
    wed: "Me",
    thu: "J",
    fri: "V",
    sat: "S",
    sun: "D",

    // Months
    january: "janvier",
    february: "février",
    march: "mars",
    april: "avril",
    may: "mai",
    june: "juin",
    july: "juillet",
    august: "août",
    september: "septembre",
    october: "octobre",
    november: "novembre",
    december: "décembre",

    // Calendar
    calendar: "Calendrier",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
    backToThisWeek: "Revenir à cette semaine",
  },

  en: {
    // Navigation
    habits: "Habits",
    tracker: "Tracker",
    notes: "Notes",
    analytics: "Analytics",
    profile: "Profile",
    settings: "Settings",

    // Profile page
    profileTitle: "Profile",
    settingsTitle: "Settings",
    statistics: "Statistics",
    badgeCollection: "Badge Collection",
    unlockedBadges: "unlocked",
    globalProgress: "Global Progress",
    completed: "Completed",
    habitsCreated: "Habits Created",
    completedToday: "Completed Today",
    currentStreak: "Current Streak",
    totalCompletions: "Total Completions",
    memberSince: "Member since January 2024",
    unlocked: "Unlocked",
    progress: "Progress",

    // Badges
    firstStep: "First Step",
    firstStepDesc: "First habit created",
    oneWeek: "One Week",
    oneWeekDesc: "7 consecutive days",
    twoWeeks: "Two Weeks",
    twoWeeksDesc: "14 consecutive days",
    champion: "Champion",
    championDesc: "30 consecutive days",
    marathoner: "Marathoner",
    marathonerDesc: "60 consecutive days",
    centurion: "Centurion",
    centurionDesc: "100 consecutive days",
    perseverant: "Perseverant",
    perseverantDesc: "50 completions",
    centenary: "Centenary",
    centenaryDesc: "100 completions",
    bicentenary: "Bicentenary",
    bicentenaryDesc: "200 completions",
    legend: "Legend",
    legendDesc: "500 completions",
    collector: "Collector",
    collectorDesc: "5 habits created",
    habitMaster: "Habit Master",
    habitMasterDesc: "10 habits created",
    writer: "Writer",
    writerDesc: "20 notes written",
    philosopher: "Philosopher",
    philosopherDesc: "50 reflection notes",
    perfectionist: "Perfectionist",
    perfectionistDesc: "5 perfect days",
    regular: "Regular",
    regularDesc: "Active 30 different days",

    // Badge categories
    beginner: "Beginner",
    series: "Series",
    achievement: "Achievement",
    collection: "Collection",
    reflection: "Reflection",
    perfection: "Perfection",
    consistency: "Consistency",

    // Settings
    language: "Interface Language",
    languageDesc: "Choose the application language",
    appearance: "Appearance",
    theme: "Theme",
    themeDesc: "Choose the application theme",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
    compactMode: "Compact Mode",
    compactModeDesc: "Denser interface",
    animations: "Animations",
    animationsDesc: "Enable animations",
    supportCommunity: "Support & Community",
    rateApp: "Rate the App",
    sendFeedback: "Send Feedback",
    shareApp: "Share the App",
    buyMeCoffee: "Buy me a coffee ☕",

    // Habit tracker
    tracking: "Tracking",
    progressPercent: "Progress",
    completedHabits: "Completed",
    record: "Record",
    activeHabits: "Habits",
    noHabitsConfigured: "No habits configured",
    createFirstHabit: "Create my first habit",
    goalTarget: "Goal",
    daysLabel: "days",
    createdOn: "Created on",
    quickNote: "Quick note",
    noteFor: "Note for",
    howDoYouFeel: "How do you feel?",
    yourNote: "Your note",
    whatHappenedToday: "What happened today?",
    createNote: "Create Note",
    cancel: "Cancel",
    reached: "Reached!",

    // Habit settings
    myHabits: "My Habits",
    reminders: "Reminders",
    newHabit: "New Habit",
    editHabit: "Edit Habit",
    habitTitle: "Habit Title",
    weeklyGoal: "Weekly Goal",
    selectDaysDesc: "Select the days you want to practice this habit",
    description: "Description",
    habitColor: "Habit Color",
    createHabit: "Create Habit",
    modify: "Modify",
    delete: "Delete",
    newReminder: "New Reminder",
    editReminder: "Edit Reminder",
    habit: "Habit",
    chooseHabit: "Choose a habit",
    time: "Time",
    days: "Days",
    customMessage: "Custom Message",
    createReminder: "Create Reminder",
    noHabitsMessage: "No habits configured",
    noRemindersMessage: "No reminders configured",
    createFirstReminder: "Create my first reminder",
    habitExample: "e.g. Read 10 pages, Exercise...",
    habitDescPlaceholder: "Why this habit is important to you...",
    reminderPlaceholder: "It's time for your habit!",
    myReminders: "My Reminders",
    reminderFor: "Reminder for",
    active: "Active",
    inactive: "Inactive",
    reminder: "reminder",
    reminders_plural: "reminders",
    createRemindersFirst: "You must first create habits to configure reminders",

    // Notes
    notesTitle: "Notes",
    newNote: "New Note",
    editNote: "Edit Note",
    linkToHabit: "Link to habit (optional)",
    noHabit: "No habit",
    noNotesYet: "No notes yet",
    writeFirstNote: "Write my first note",
    startWritingReflections: "Start writing your reflections and track your progress",
    notesCount: "note",
    notesCountPlural: "notes",

    // Analytics
    analysesTitle: "Analytics",
    allHabits: "All Habits",
    period: "Period",
    days7: "7 days",
    month1: "1 month",
    months3: "3 months",
    months6: "6 months",
    year1: "1 year",
    emotionalWellbeing: "Emotional Wellbeing",
    averageMood: "Average Mood",
    positiveMoods: "Positive Moods",
    notesWithMood: "Notes with Mood",
    noMoodData: "No mood data",
    startWritingNotes: "Start writing notes with your mood to track your emotional wellbeing",
    performanceEvolution: "Performance Evolution",
    success: "Success",
    failures: "Failures",
    notRealized: "Not Realized",
    performanceByHabit: "Performance by Habit",
    trends: "Trends",
    mostRegularHabit: "Most Regular Habit",
    notesInPeriod: "Notes in Period",
    globalProgression: "Global Progression",
    excellent: "Excellent",
    good: "Good",
    toImprove: "To Improve",
    tipOfDay: "💡 Tip of the Day",
    excellentWork: "Excellent work! Your consistency is remarkable. Keep it up!",
    onRightTrack: "You're on the right track! Try to focus on one habit at a time.",
    startSmall: "Start small! Choose one habit and focus on it for a week.",
    thisMonth: "this month",
    noActiveHabits: "No active habits to track",
    completions: "Completions",
    perfectDays: "Perfect Days",
    successRate: "Success Rate",
    trackedHabits: "Tracked Habits",
    currentWeek: "Current week",
    onPeriod: "On period",

    // Common
    save: "Save",
    edit: "Edit",
    back: "Back",
    close: "Close",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    warning: "Warning",
    info: "Information",

    // Days of week
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",

    // Day abbreviations
    mon: "M",
    tue: "T",
    wed: "W",
    thu: "T",
    fri: "F",
    sat: "S",
    sun: "S",

    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",

    // Calendar
    calendar: "Calendar",
    today: "Today",
    thisWeek: "This week",
    backToThisWeek: "Back to this week",
  },
}

export function useTranslations() {
  const { settings } = useSettings()
  const currentLanguage = settings.language || "fr"

  const t = (key: keyof Translations): string => {
    return translations[currentLanguage]?.[key] || translations.fr[key] || key
  }

  return { t, currentLanguage }
}
