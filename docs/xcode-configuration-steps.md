# 🍎 Configuration Xcode pour Routina

## 1. Ouverture du projet

\`\`\`bash
# Depuis le dossier racine de Routina
npx cap open ios
\`\`\`

## 2. Configuration de l'équipe de développement

### Dans Xcode :
1. **Sélectionner le projet** `App` dans le navigateur
2. **Onglet "Signing & Capabilities"**
3. **Team** : Sélectionner votre équipe de développement Apple
4. **Bundle Identifier** : Vérifier que c'est `com.routina.app`

### Si vous n'avez pas d'équipe :
1. Aller sur [developer.apple.com](https://developer.apple.com)
2. Se connecter avec votre Apple ID
3. Rejoindre le programme développeur (99€/an)

## 3. Configuration des certificats

### Certificats automatiques (recommandé) :
1. **Cocher "Automatically manage signing"**
2. Xcode va créer automatiquement les certificats

### Certificats manuels (avancé) :
1. Décocher "Automatically manage signing"
2. Sélectionner manuellement les profils de provisioning

## 4. Configuration de l'app

### Informations générales :
- **Display Name** : `Routina`
- **Bundle Identifier** : `com.routina.app`
- **Version** : `1.0.0`
- **Build** : `1`

### Capabilities nécessaires :
1. **Push Notifications** (pour les rappels)
2. **Background App Refresh** (pour les notifications)
3. **App Groups** (pour le partage de données)

## 5. Configuration des icônes

### Ajouter les icônes :
1. **App Icons & Launch Images** → **AppIcon**
2. Glisser-déposer les icônes aux bonnes tailles :
   - 20x20, 29x29, 40x40, 58x58, 60x60, 80x80, 87x87, 120x120, 180x180
   - 1024x1024 (App Store)

## 6. Tests sur simulateur

### Lancer sur simulateur :
1. **Sélectionner un simulateur** (ex: iPhone 14 Pro)
2. **Cliquer sur le bouton Play** ▶️
3. **Vérifier que l'app se lance correctement**

### Tests à effectuer :
- ✅ Lancement de l'app
- ✅ Navigation entre les onglets
- ✅ Création d'une habitude
- ✅ Marquage d'une habitude comme complétée
- ✅ Notifications (si configurées)

## 7. Tests sur appareil physique

### Connecter l'appareil :
1. **Connecter l'iPhone/iPad** via USB
2. **Faire confiance à l'ordinateur** sur l'appareil
3. **Sélectionner l'appareil** dans Xcode

### Configuration de l'appareil :
1. **Réglages** → **Général** → **Gestion des appareils**
2. **Faire confiance au développeur**

### Tests sur appareil :
- ✅ Performance générale
- ✅ Notifications push
- ✅ Stockage local
- ✅ Interface tactile
- ✅ Rotation d'écran

## 8. Résolution des problèmes courants

### Erreur de signature :
\`\`\`
Code signing error: No profiles for 'com.routina.app' were found
\`\`\`
**Solution** : Vérifier l'équipe de développement et les certificats

### Erreur de Bundle ID :
\`\`\`
Bundle identifier is already in use
\`\`\`
**Solution** : Changer le Bundle ID ou utiliser celui existant

### Erreur de version Xcode :
\`\`\`
This version of Xcode does not support iOS 17.0
\`\`\`
**Solution** : Mettre à jour Xcode ou changer la version iOS cible

## 9. Préparation pour l'App Store

### Archive pour distribution :
1. **Product** → **Archive**
2. **Window** → **Organizer**
3. **Distribute App** → **App Store Connect**

### Validation avant soumission :
1. **Validate App** (vérification automatique)
2. Corriger les erreurs/avertissements
3. **Upload to App Store**
