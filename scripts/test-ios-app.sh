#!/bin/bash

echo "🧪 Script de test pour Routina iOS"
echo "=================================="

# Fonction pour tester sur simulateur
test_simulator() {
    echo "📱 Test sur simulateur iOS..."
    
    # Lister les simulateurs disponibles
    echo "Simulateurs disponibles:"
    xcrun simctl list devices available | grep "iPhone" | head -5
    
    # Démarrer le simulateur par défaut
    SIMULATOR_ID=$(xcrun simctl list devices available | grep "iPhone 14 Pro" | head -1 | grep -o '[A-F0-9-]\{36\}')
    
    if [ -n "$SIMULATOR_ID" ]; then
        echo "Démarrage du simulateur iPhone 14 Pro..."
        xcrun simctl boot $SIMULATOR_ID
        open -a Simulator
        
        echo "✅ Simulateur démarré"
        echo "🎯 Maintenant, dans Xcode:"
        echo "1. Sélectionner iPhone 14 Pro comme cible"
        echo "2. Cliquer sur le bouton Play ▶️"
        echo "3. Tester les fonctionnalités de Routina"
    else
        echo "❌ Simulateur iPhone 14 Pro non trouvé"
    fi
}

# Fonction pour tester sur appareil physique
test_physical_device() {
    echo "📱 Test sur appareil physique..."
    
    # Lister les appareils connectés
    echo "Appareils connectés:"
    xcrun devicectl list devices
    
    echo ""
    echo "🎯 Pour tester sur appareil physique:"
    echo "1. Connecter votre iPhone/iPad via USB"
    echo "2. Faire confiance à cet ordinateur sur l'appareil"
    echo "3. Dans Xcode, sélectionner votre appareil"
    echo "4. Cliquer sur Play ▶️"
    echo "5. Si erreur de signature, aller dans Réglages > Général > Gestion des appareils"
}

# Fonction de tests automatisés
run_automated_tests() {
    echo "🤖 Tests automatisés..."
    
    # Build pour test
    echo "Construction pour test..."
    xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 14 Pro' build-for-testing
    
    if [ $? -eq 0 ]; then
        echo "✅ Build de test réussi"
        
        # Lancer les tests
        echo "Lancement des tests..."
        xcodebuild -workspace ios/App/App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 14 Pro' test
    else
        echo "❌ Échec du build de test"
    fi
}

# Menu principal
echo ""
echo "Choisissez le type de test:"
echo "1) Test sur simulateur"
echo "2) Test sur appareil physique"
echo "3) Tests automatisés"
echo "4) Tous les tests"

read -p "Votre choix (1-4): " choice

case $choice in
    1)
        test_simulator
        ;;
    2)
        test_physical_device
        ;;
    3)
        run_automated_tests
        ;;
    4)
        test_simulator
        test_physical_device
        run_automated_tests
        ;;
    *)
        echo "Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Script de test terminé"
echo ""
echo "📋 CHECKLIST DE TEST:"
echo "□ L'app se lance sans crash"
echo "□ Navigation entre les onglets fonctionne"
echo "□ Création d'habitude fonctionne"
echo "□ Marquage d'habitude fonctionne"
echo "□ Sauvegarde des données fonctionne"
echo "□ Interface responsive sur différentes tailles"
echo "□ Notifications (si configurées)"
echo "□ Performance fluide"
