# 🏗️ Architecture Technique - MSFS Copilot Assistant

## Vue d'Ensemble

L'application est construite avec une architecture client-serveur moderne utilisant Node.js, Express, WebSocket et l'API Web Speech.

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigateur Web (Client)                   │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Interface Web │  │ Web Speech   │  │ WebSocket Client│ │
│  │  (HTML/CSS/JS) │  │     API      │  │                 │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
└───────────┼──────────────────┼───────────────────┼──────────┘
            │                  │                   │
            │ HTTP/REST        │ Voice Commands    │ WebSocket
            │                  │                   │
┌───────────▼──────────────────▼───────────────────▼──────────┐
│                    Serveur Node.js                           │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Express.js    │  │   WebSocket  │  │   SimConnect    │ │
│  │   API REST     │  │    Server    │  │    Manager      │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
└───────────┼──────────────────┼───────────────────┼──────────┘
            │                  │                   │
            └──────────────────┴───────────────────┘
                                │
                                │ SimConnect Protocol
                                │
                    ┌───────────▼──────────┐
                    │   MSFS 2024          │
                    │   (Flight Simulator) │
                    └──────────────────────┘
```

## Composants Principaux

### 1. Backend (Node.js)

#### `src/server/index.js` - Serveur Principal
- **Rôle**: Point d'entrée de l'application
- **Responsabilités**:
  - Initialisation du serveur Express
  - Configuration des routes API REST
  - Gestion des middlewares (CORS, JSON parsing)
  - Coordination entre SimConnect et WebSocket
  - Gestion gracieuse de l'arrêt

#### `src/server/simconnect.js` - Gestionnaire SimConnect
- **Rôle**: Interface avec MSFS2024 via SimConnect
- **Responsabilités**:
  - Connexion/déconnexion à SimConnect
  - Définition des variables de simulation à surveiller
  - Envoi d'événements (key events) au simulateur
  - Lecture de l'état du cockpit
  - Gestion des erreurs de connexion
- **Méthodes principales**:
  - `connect()`: Établit la connexion avec MSFS
  - `toggleAutopilot()`: Bascule l'autopilote
  - `setAltitudeHold()`: Règle l'altitude
  - `toggleLight()`: Contrôle les lumières
  - `setFlaps()`: Règle les volets
  - `getCockpitState()`: Retourne l'état actuel

#### `src/server/websocket.js` - Serveur WebSocket
- **Rôle**: Communication temps réel avec les clients
- **Responsabilités**:
  - Gestion des connexions WebSocket
  - Diffusion des mises à jour d'état
  - Notification des actions exécutées
  - Gestion des reconnexions
- **Messages**:
  - `state_update`: État du cockpit
  - `action_result`: Résultat d'une action
  - `voice_command`: Commande vocale reçue
  - `simconnect_status`: État de la connexion SimConnect

### 2. Frontend (Web)

#### `src/public/index.html` - Interface Utilisateur
- **Rôle**: Structure de l'interface web
- **Sections**:
  - Header avec statut de connexion
  - Section commande vocale
  - Tableau de bord (état du cockpit)
  - Panneaux de contrôle (boutons)
  - Journal d'activité

#### `src/public/css/style.css` - Styles
- **Rôle**: Apparence et mise en page
- **Caractéristiques**:
  - Design moderne avec thème sombre
  - Variables CSS pour personnalisation
  - Responsive design (mobile-friendly)
  - Animations et transitions
  - Indicateurs visuels d'état

#### `src/public/js/app.js` - Logique Principale
- **Rôle**: Gestion de l'interface et des interactions
- **Responsabilités**:
  - Mise à jour de l'affichage
  - Gestion des boutons de contrôle
  - Appels API REST
  - Journal d'activité
  - Raccourcis clavier
- **Fonctions principales**:
  - `updateCockpitState()`: Met à jour l'affichage
  - `apiCall()`: Helper pour appels API
  - `logActivity()`: Ajoute une entrée au journal
  - Fonctions de contrôle (autopilot, lights, gear, flaps)

#### `src/public/js/websocket.js` - Client WebSocket
- **Rôle**: Communication temps réel avec le serveur
- **Responsabilités**:
  - Connexion au serveur WebSocket
  - Réception des mises à jour
  - Gestion des reconnexions automatiques
  - Distribution des messages aux composants
- **Classe**: `WebSocketClient`
  - `connect()`: Établit la connexion
  - `handleMessage()`: Traite les messages reçus
  - `send()`: Envoie un message
  - `on()`: Enregistre un listener
  - `emit()`: Déclenche un événement

#### `src/public/js/voice.js` - Reconnaissance Vocale
- **Rôle**: Gestion des commandes vocales
- **Responsabilités**:
  - Initialisation de Web Speech API
  - Reconnaissance vocale en français
  - Parsing des commandes
  - Exécution des actions correspondantes
  - Feedback utilisateur
- **Classe**: `VoiceRecognition`
  - `start()`: Démarre l'écoute
  - `processCommand()`: Analyse la commande
  - `matchCommand()`: Vérifie la correspondance
  - `executeAction()`: Exécute l'action

### 3. Configuration

#### `src/config/commands.json` - Commandes Vocales
- **Rôle**: Définition des commandes vocales
- **Structure**:
  ```json
  {
    "category": {
      "action": ["phrase1", "phrase2", ...]
    }
  }
  ```
- **Catégories**:
  - `autopilot`: Commandes autopilote
  - `lights`: Commandes lumières
  - `gear`: Commandes train
  - `flaps`: Commandes volets
  - `radio`: Commandes radio
  - `general`: Commandes générales

## Flux de Données

### 1. Commande Vocale → Action
```
Utilisateur parle
    ↓
Web Speech API (reconnaissance)
    ↓
voice.js (parsing)
    ↓
API REST (POST /api/...)
    ↓
Express Router
    ↓
SimConnect Manager (action)
    ↓
MSFS 2024 (exécution)
    ↓
WebSocket (notification)
    ↓
Interface Web (feedback)
```

### 2. Mise à Jour d'État
```
MSFS 2024 (changement d'état)
    ↓
SimConnect (lecture périodique)
    ↓
SimConnect Manager (état)
    ↓
WebSocket Server (broadcast)
    ↓
WebSocket Client (réception)
    ↓
app.js (mise à jour UI)
    ↓
Interface Web (affichage)
```

### 3. Action par Bouton
```
Utilisateur clique
    ↓
app.js (handler)
    ↓
API REST (POST /api/...)
    ↓
Express Router
    ↓
SimConnect Manager (action)
    ↓
MSFS 2024 (exécution)
    ↓
WebSocket (notification)
    ↓
Interface Web (feedback)
```

## Technologies Utilisées

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **ws**: Bibliothèque WebSocket
- **node-simconnect**: Interface SimConnect
- **dotenv**: Gestion des variables d'environnement
- **cors**: Gestion CORS

### Frontend
- **HTML5**: Structure
- **CSS3**: Styles (variables, grid, flexbox, animations)
- **JavaScript ES6+**: Logique (classes, async/await, modules)
- **Web Speech API**: Reconnaissance vocale
- **WebSocket API**: Communication temps réel

### Protocoles
- **HTTP/REST**: API de contrôle
- **WebSocket**: Communication bidirectionnelle temps réel
- **SimConnect**: Communication avec MSFS2024

## Patterns et Principes

### Design Patterns
- **Singleton**: Instances globales (wsClient, voiceRecognition)
- **Observer**: WebSocket listeners et événements
- **Factory**: Création de messages WebSocket
- **Manager**: Gestion centralisée (SimConnect, WebSocket)

### Principes
- **Separation of Concerns**: Modules distincts par responsabilité
- **Single Responsibility**: Chaque classe a un rôle unique
- **DRY**: Fonctions réutilisables (apiCall, updateElement)
- **Error Handling**: Gestion des erreurs à tous les niveaux
- **Graceful Degradation**: Fonctionnement même si certaines fonctionnalités échouent

## Sécurité

### Mesures Implémentées
- **CORS**: Configuration pour limiter les origines
- **Validation**: Vérification des entrées utilisateur
- **Error Handling**: Pas d'exposition d'informations sensibles
- **Rate Limiting**: (À implémenter pour production)

### Recommandations Production
- Ajouter HTTPS
- Implémenter l'authentification
- Ajouter rate limiting
- Logger les actions sensibles
- Valider toutes les entrées côté serveur

## Performance

### Optimisations
- **WebSocket**: Communication efficace temps réel
- **Debouncing**: Limitation des mises à jour UI
- **Lazy Loading**: Chargement à la demande
- **Caching**: État en mémoire côté serveur

### Métriques
- Latence WebSocket: < 50ms
- Temps de réponse API: < 100ms
- Reconnaissance vocale: < 500ms
- Mise à jour UI: 60 FPS

## Évolutivité

### Extensions Possibles
1. **Multi-utilisateurs**: Support de plusieurs clients
2. **Persistance**: Sauvegarde des configurations
3. **Plugins**: Système de plugins pour avions spécifiques
4. **Cloud**: Déploiement cloud pour accès distant
5. **Mobile**: Application mobile native
6. **IA**: Assistant intelligent avec contexte

### Limitations Actuelles
- Connexion locale uniquement (SimConnect)
- Un seul simulateur à la fois
- Pas de persistance des données
- Commandes vocales limitées au français

## Tests

### Tests Recommandés
- **Unit Tests**: Fonctions individuelles
- **Integration Tests**: API endpoints
- **E2E Tests**: Flux complets
- **Voice Tests**: Reconnaissance vocale
- **Load Tests**: Performance sous charge

### Outils Suggérés
- Jest: Tests unitaires
- Supertest: Tests API
- Puppeteer: Tests E2E
- Artillery: Tests de charge

---

**Note**: Cette architecture est conçue pour être modulaire et extensible. Chaque composant peut être amélioré ou remplacé indépendamment.