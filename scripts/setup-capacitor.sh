#!/bin/bash

echo "🚀 Configuration de Capacitor pour Habit Tracker..."

# Installation des dépendances Capacitor
echo "📦 Installation des packages Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/app @capacitor/haptics @capacitor/local-notifications @capacitor/preferences @capacitor/share @capacitor/splash-screen @capacitor/status-bar

# Installation des plateformes
echo "📱 Installation des plateformes iOS et Android..."
npm install @capacitor/ios @capacitor/android

# Initialisation de Capacitor
echo "⚙️ Initialisation de Capacitor..."
npx cap init "Habit Tracker" "com.habittracker.app" --web-dir=out

# Ajout des plateformes
echo "🔧 Ajout des plateformes..."
npx cap add ios
npx cap add android

# Build du projet
echo "🏗️ Build du projet Next.js..."
npm run build

# Synchronisation avec les plateformes natives
echo "🔄 Synchronisation avec les plateformes..."
npx cap sync

echo "✅ Configuration terminée !"
echo ""
echo "Pour ouvrir les projets natifs :"
echo "iOS: npx cap open ios"
echo "Android: npx cap open android"
echo ""
echo "Pour rebuilder et synchroniser :"
echo "npm run cap:build"
