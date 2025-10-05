#!/bin/bash

echo "🍎 Guide de configuration Xcode pour Routina"
echo "============================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis Xcode..."

# Vérifier Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode n'est pas installé"
    echo "Téléchargez Xcode depuis l'App Store"
    exit 1
fi

# Vérifier la version Xcode
XCODE_VERSION=$(xcodebuild -version | head -n1 | awk '{print $2}')
echo "✅ Xcode version: $XCODE_VERSION"

# Vérifier les outils de ligne de commande
if ! xcode-select -p &> /dev/null; then
    echo "⚠️  Installation des outils de ligne de commande..."
    xcode-select --install
fi

# Lister les simulateurs disponibles
echo "📱 Simulateurs iOS disponibles:"
xcrun simctl list devices available | grep "iPhone"

# Lister les appareils connectés
echo "🔌 Appareils physiques connectés:"
xcrun devicectl list devices

echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "1. Ouvrir le projet: npx cap open ios"
echo "2. Suivre le guide de configuration ci-dessous"
echo ""
