#!/bin/bash

echo "🚀 Script de build production pour iOS - Routina"
echo "================================================"

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode n'est pas installé"
    exit 1
fi

# Vérifier Capacitor CLI
if ! command -v cap &> /dev/null; then
    echo "❌ Capacitor CLI n'est pas installé"
    echo "Installez avec: npm install -g @capacitor/cli"
    exit 1
fi

echo "✅ Tous les prérequis sont installés"

# Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
rm -rf out/
rm -rf ios/App/App/public/

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci

# Build de production Next.js
echo "🏗️ Build de production Next.js..."
npm run build

if [ ! -d "out" ]; then
    echo "❌ Le build Next.js a échoué"
    exit 1
fi

echo "✅ Build Next.js terminé"

# Synchronisation Capacitor
echo "🔄 Synchronisation Capacitor..."
npx cap sync ios

# Vérification de la configuration iOS
echo "🔍 Vérification de la configuration iOS..."

if [ ! -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
    echo "❌ Projet Xcode non trouvé"
    exit 1
fi

echo "✅ Configuration iOS vérifiée"

# Ouvrir Xcode pour la configuration finale
echo "📱 Ouverture de Xcode..."
echo ""
echo "🎯 ÉTAPES SUIVANTES DANS XCODE :"
echo "1. Sélectionner l'équipe de développement"
echo "2. Configurer le Bundle ID : com.routina.app"
echo "3. Définir la version : 1.0.0"
echo "4. Configurer les icônes et splash screens"
echo "5. Tester sur simulateur et appareil physique"
echo "6. Archiver pour l'App Store"
echo ""

npx cap open ios

echo "✅ Script terminé - Xcode est ouvert"
