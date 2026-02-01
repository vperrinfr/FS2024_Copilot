# ✈️ MSFS 2024 Copilot Assistant

Assistant copilote intelligent pour Microsoft Flight Simulator 2024 avec commandes vocales en français et interface web moderne.

## 🎯 Fonctionnalités

### Commandes Vocales 🎤
- Reconnaissance vocale en français
- Contrôle mains-libres du cockpit
- Feedback visuel et audio en temps réel

### Actions Supportées ⚙️
- **Autopilote**: Activation/désactivation, altitude hold, heading hold, nav mode, approach mode
- **Lumières**: Beacon, strobe, navigation, landing, taxi (individuelles ou toutes ensemble)
- **Train d'atterrissage**: Sortie, rentrée, toggle
- **Volets**: Positions 0%, 25%, 50%, 100%
- **Radio**: Changement de fréquences COM1/COM2, NAV1/NAV2

### Interface Web 🖥️
- Tableau de bord en temps réel
- Affichage de l'état du cockpit
- Contrôles par boutons
- Journal d'activité
- Design moderne et responsive

### Communication Temps Réel 📡
- WebSocket pour mises à jour instantanées
- Synchronisation automatique avec MSFS2024
- Reconnexion automatique

### 🌐 Accès Réseau
- **Contrôlez depuis votre Mac !** L'application tourne sur PC Windows, accessible depuis n'importe quel appareil du réseau
- Support multi-clients (plusieurs appareils simultanément)
- Commandes vocales fonctionnent depuis le Mac/iPad/iPhone
- Configuration simple en 5 minutes

## 📋 Prérequis

### Serveur (PC Windows)
- **Windows 10/11** (requis pour SimConnect)
- **Node.js 18+** installé
- **Microsoft Flight Simulator 2024** installé avec SimConnect SDK

### Client (Mac/Autres Appareils)
- **Navigateur moderne** (Chrome, Safari, ou Edge)
- **Connexion au même réseau local** que le PC Windows
- Aucune installation nécessaire !

## 🚀 Installation

### 1. Cloner ou télécharger le projet

```bash
cd /chemin/vers/MSFS2024
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration (optionnel)

Le fichier `.env` contient la configuration par défaut. Vous pouvez modifier le port si nécessaire :

```env
PORT=3000
```

## 🎮 Utilisation

### Utilisation Locale (PC Windows uniquement)

1. **Démarrer MSFS 2024** et charger un vol
2. **Démarrer l'application** : `npm start`
3. **Ouvrir** : http://localhost:3000

### 🌐 Utilisation Réseau (depuis Mac/autres appareils)

1. **Sur PC Windows** :
   - Démarrer MSFS 2024 et charger un vol
   - Démarrer l'application : `npm start`
   - Noter l'IP affichée (ex: `http://192.168.1.100:3000`)

2. **Sur Mac/iPad/iPhone** :
   - Ouvrir Safari/Chrome
   - Aller à l'adresse affichée : `http://192.168.1.100:3000`
   - Utiliser l'interface normalement !

📖 **Guide complet** : Voir [NETWORK_SETUP.md](NETWORK_SETUP.md) pour la configuration détaillée

### 4. Utiliser les commandes vocales

1. Cliquez sur le bouton **"Appuyez pour parler"** ou appuyez sur la touche **V**
2. Attendez que le bouton devienne vert
3. Prononcez votre commande en français
4. L'action sera exécutée automatiquement

## 🎤 Exemples de Commandes Vocales

### Autopilote
- "Active l'autopilote"
- "Désactive l'autopilote"
- "Monte à 10000 pieds"
- "Cap 270"
- "Mode navigation"
- "Mode approche"

### Lumières
- "Allume beacon"
- "Éteins strobe"
- "Allume les lumières d'atterrissage"
- "Allume toutes les lumières"
- "Éteins toutes les lumières"

### Train d'atterrissage
- "Sors le train"
- "Rentre le train"

### Volets
- "Volets zéro"
- "Volets 25 pourcent"
- "Volets 50 pourcent"
- "Volets complets"

### Général
- "Aide" - Affiche les commandes disponibles
- "Statut" - Demande une mise à jour de l'état

## ⌨️ Raccourcis Clavier

- **V** - Activer la commande vocale
- **G** - Toggle train d'atterrissage
- **A** - Toggle autopilote

## 📁 Structure du Projet

```
msfs-copilot/
├── src/
│   ├── server/
│   │   ├── index.js          # Serveur Express principal
│   │   ├── simconnect.js     # Gestionnaire SimConnect
│   │   └── websocket.js      # Serveur WebSocket
│   ├── public/
│   │   ├── index.html        # Interface web
│   │   ├── css/
│   │   │   └── style.css     # Styles
│   │   └── js/
│   │       ├── app.js        # Logique principale
│   │       ├── voice.js      # Reconnaissance vocale
│   │       └── websocket.js  # Client WebSocket
│   └── config/
│       └── commands.json     # Configuration commandes vocales
├── package.json
├── .env
└── README.md
```

## 🔧 API REST

L'application expose une API REST pour contrôler le cockpit :

### Autopilote
- `POST /api/autopilot/toggle` - Toggle autopilote
- `POST /api/autopilot/altitude` - Régler altitude (body: `{ altitude: 10000 }`)
- `POST /api/autopilot/heading` - Régler cap (body: `{ heading: 270 }`)
- `POST /api/autopilot/nav` - Toggle mode NAV
- `POST /api/autopilot/approach` - Toggle mode approche

### Lumières
- `POST /api/lights/:type` - Toggle lumière (beacon, strobe, nav, landing, taxi)
- `POST /api/lights/all/on` - Allumer toutes les lumières
- `POST /api/lights/all/off` - Éteindre toutes les lumières

### Train
- `POST /api/gear/toggle` - Toggle train
- `POST /api/gear/down` - Sortir le train
- `POST /api/gear/up` - Rentrer le train

### Volets
- `POST /api/flaps/set` - Régler volets (body: `{ position: 25 }`)
- `POST /api/flaps/increase` - Augmenter volets
- `POST /api/flaps/decrease` - Diminuer volets

### État
- `GET /api/status` - Obtenir l'état actuel du cockpit
- `GET /api/health` - Vérifier la santé du serveur

## 🐛 Dépannage

### SimConnect ne se connecte pas

1. Vérifiez que MSFS2024 est en cours d'exécution
2. Vérifiez que vous êtes dans un vol actif (pas dans le menu principal)
3. Redémarrez l'application
4. Vérifiez que SimConnect SDK est installé avec MSFS2024

### La reconnaissance vocale ne fonctionne pas

1. Utilisez Chrome ou Edge (meilleur support)
2. Autorisez l'accès au microphone quand demandé
3. Vérifiez que votre microphone fonctionne
4. Parlez clairement et pas trop vite

### Les commandes ne s'exécutent pas

1. Vérifiez que SimConnect est connecté (indicateur vert)
2. Vérifiez le journal d'activité pour les erreurs
3. Certaines commandes peuvent ne pas fonctionner selon l'avion
4. Consultez la console du navigateur (F12) pour les erreurs

## 🔮 Évolutions Futures

- [ ] Support multi-langues (anglais, espagnol, etc.)
- [ ] Actions avancées (FMS, systèmes complexes)
- [ ] Profils d'avions personnalisés
- [ ] Checklists automatisées
- [ ] Intégration IA pour assistance contextuelle
- [ ] Application mobile companion
- [ ] Support pour X-Plane et Prepar3D

## 📝 Notes Importantes

- L'application doit tourner sur la même machine que MSFS2024
- SimConnect nécessite que MSFS2024 soit en cours d'exécution
- Certaines actions peuvent varier selon l'avion utilisé
- La reconnaissance vocale fonctionne mieux dans un environnement calme

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Ajouter de nouvelles commandes vocales

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🙏 Remerciements

- Microsoft Flight Simulator 2024 et SimConnect SDK
- Bibliothèque node-simconnect
- Communauté des développeurs de simulateurs de vol

---

**Bon vol ! ✈️**

Pour toute question ou problème, consultez les logs de l'application ou ouvrez une issue.