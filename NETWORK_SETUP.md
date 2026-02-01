# 🌐 Configuration Réseau - Accès depuis Mac/Autres Appareils

Ce guide explique comment configurer l'application pour y accéder depuis votre Mac (ou tout autre appareil) pendant que MSFS 2024 tourne sur un PC Windows.

## 📋 Prérequis

### Sur le PC Windows (Serveur)
- ✅ Windows 10/11
- ✅ MSFS 2024 installé
- ✅ Node.js 18+ installé
- ✅ Application MSFS Copilot installée
- ✅ Connexion au réseau local (WiFi ou Ethernet)

### Sur le Mac (Client)
- ✅ macOS (n'importe quelle version récente)
- ✅ Navigateur web (Safari, Chrome, ou Edge)
- ✅ Connexion au même réseau local que le PC

## 🚀 Configuration Rapide

### Étape 1 : Configuration du Serveur (PC Windows)

L'application est déjà configurée pour l'accès réseau ! Le fichier `.env` contient :

```env
HOST=0.0.0.0
PORT=3000
SHOW_NETWORK_INFO=true
```

### Étape 2 : Configurer le Pare-feu Windows

**Important** : Vous devez autoriser Node.js dans le pare-feu Windows.

#### Option A : Configuration Automatique (Recommandé)

Lors du premier démarrage, Windows vous demandera l'autorisation :

1. Lancez l'application : `npm start`
2. Une fenêtre "Alerte de sécurité Windows" apparaît
3. ✅ Cochez **"Réseaux privés"** (votre réseau local)
4. ❌ Ne cochez PAS "Réseaux publics" (sécurité)
5. Cliquez sur **"Autoriser l'accès"**

#### Option B : Configuration Manuelle

Si la fenêtre n'apparaît pas ou si vous l'avez refusée :

1. Ouvrez **Panneau de configuration** → **Système et sécurité** → **Pare-feu Windows Defender**
2. Cliquez sur **"Autoriser une application ou une fonctionnalité via le Pare-feu Windows Defender"**
3. Cliquez sur **"Modifier les paramètres"** (nécessite droits admin)
4. Cliquez sur **"Autoriser une autre application..."**
5. Parcourez et sélectionnez : `C:\Program Files\nodejs\node.exe`
6. Cliquez sur **"Ajouter"**
7. ✅ Cochez **"Privé"** pour Node.js
8. Cliquez sur **"OK"**

#### Option C : Règle de Pare-feu Spécifique (Avancé)

Créer une règle pour le port 3000 uniquement :

```powershell
# Ouvrir PowerShell en tant qu'Administrateur
New-NetFirewallRule -DisplayName "MSFS Copilot" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Étape 3 : Trouver l'Adresse IP du PC Windows

#### Méthode 1 : Automatique (Recommandé)

Lancez l'application, elle affichera automatiquement l'IP :

```bash
npm start
```

Vous verrez :

```
╔════════════════════════════════════════════╗
║     MSFS 2024 Copilot Assistant           ║
╚════════════════════════════════════════════╝

🚀 Server running on http://0.0.0.0:3000
📡 WebSocket server ready

🌐 Network Access:
   Local:   http://localhost:3000
   Network: http://192.168.1.100:3000    ← CETTE ADRESSE !

💡 Access from Mac/other devices:
   Open http://192.168.1.100:3000 in your browser
```

#### Méthode 2 : Manuelle

**Windows - Invite de commandes :**
```cmd
ipconfig
```

Cherchez "Adresse IPv4" sous votre adaptateur réseau actif :
```
Carte réseau sans fil Wi-Fi:
   Adresse IPv4. . . . . . . . . . . . . .: 192.168.1.100
```

**Windows - PowerShell :**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"}
```

### Étape 4 : Démarrer le Serveur

Sur le PC Windows :

```bash
# 1. Lancer MSFS 2024 et charger un vol
# 2. Démarrer l'application
npm start
```

### Étape 5 : Se Connecter depuis le Mac

Sur votre Mac :

1. Ouvrez **Safari**, **Chrome**, ou **Edge**
2. Entrez l'adresse affichée par le serveur :
   ```
   http://192.168.1.100:3000
   ```
   (Remplacez `192.168.1.100` par l'IP de votre PC)

3. L'interface devrait s'afficher !
4. Vérifiez l'indicateur de connexion en haut à droite

## ✅ Vérification

### Test de Connexion

1. **Indicateur de statut** : Doit afficher "MSFS2024 Connecté ✓" en vert
2. **Tableau de bord** : Doit afficher les données de vol en temps réel
3. **Test bouton** : Cliquez sur "Beacon" - la lumière doit s'allumer dans MSFS
4. **Test vocal** : Dites "Allume beacon" - doit fonctionner avec le micro du Mac

### Commandes de Test

```bash
# Depuis le Mac, tester l'API avec curl
curl http://192.168.1.100:3000/api/health

# Devrait retourner :
# {"status":"ok","simconnect":true,"timestamp":"..."}
```

## 🎤 Commandes Vocales sur Mac

Les commandes vocales fonctionnent parfaitement depuis le Mac :

1. Le **microphone de votre Mac** est utilisé
2. La **reconnaissance vocale** se fait dans le navigateur
3. Seule la **commande texte** est envoyée au serveur
4. Le serveur l'exécute dans MSFS

**Navigateurs recommandés pour la reconnaissance vocale :**
- ✅ **Chrome** (meilleur support)
- ✅ **Edge** (excellent support)
- ⚠️ **Safari** (support limité, peut nécessiter autorisation micro)

## 🔧 Dépannage

### Problème : "Impossible de se connecter"

**Vérifications :**

1. **Les deux appareils sont sur le même réseau ?**
   ```bash
   # Sur Mac, vérifier l'IP
   ifconfig | grep "inet "
   # Doit être dans la même plage (ex: 192.168.1.x)
   ```

2. **Le pare-feu Windows autorise Node.js ?**
   - Voir Étape 2 ci-dessus

3. **Le serveur est bien démarré ?**
   ```bash
   # Sur PC Windows
   npm start
   # Doit afficher "Server running"
   ```

4. **L'IP est correcte ?**
   - Utilisez l'IP affichée par le serveur
   - Pas `localhost` ou `127.0.0.1` depuis le Mac

5. **Le port 3000 est libre ?**
   ```bash
   # Sur PC Windows
   netstat -ano | findstr :3000
   # Ne doit montrer qu'une seule ligne (le serveur)
   ```

### Problème : "SimConnect non connecté"

1. **MSFS 2024 est lancé ?**
   - Doit être en vol actif, pas dans le menu

2. **Redémarrer l'application**
   ```bash
   # Ctrl+C pour arrêter
   npm start
   ```

### Problème : "Commandes vocales ne fonctionnent pas"

1. **Autoriser le microphone dans le navigateur**
   - Safari : Préférences → Sites web → Microphone
   - Chrome : Paramètres → Confidentialité → Microphone

2. **Tester le microphone**
   - Ouvrir les préférences système du Mac
   - Son → Entrée → Parler pour tester

3. **Utiliser Chrome ou Edge**
   - Meilleur support de Web Speech API

### Problème : "Connexion lente ou instable"

1. **Utiliser Ethernet au lieu de WiFi** (sur PC ou Mac)
2. **Rapprocher du routeur WiFi**
3. **Vérifier la charge réseau** (pas de téléchargements lourds)
4. **Redémarrer le routeur** si nécessaire

### Problème : "L'IP change à chaque redémarrage"

**Solution : IP statique sur le PC Windows**

1. Ouvrir **Paramètres** → **Réseau et Internet**
2. Cliquer sur votre connexion (WiFi ou Ethernet)
3. Cliquer sur **"Propriétés"**
4. Sous **"Paramètres IP"**, cliquer sur **"Modifier"**
5. Choisir **"Manuel"**
6. Activer **IPv4**
7. Entrer :
   - **Adresse IP** : 192.168.1.100 (ou autre dans votre plage)
   - **Masque de sous-réseau** : 255.255.255.0
   - **Passerelle** : 192.168.1.1 (IP de votre routeur)
   - **DNS préféré** : 8.8.8.8 (Google DNS)
8. Sauvegarder

## 📱 Accès depuis d'Autres Appareils

L'architecture fonctionne avec **n'importe quel appareil** sur le réseau :

### iPad/iPhone
```
Safari → http://192.168.1.100:3000
```

### Tablette Android
```
Chrome → http://192.168.1.100:3000
```

### Autre PC Windows/Linux
```
Navigateur → http://192.168.1.100:3000
```

### Plusieurs Clients Simultanés

✅ **Oui !** Plusieurs appareils peuvent se connecter en même temps :
- Chacun voit les mêmes données en temps réel
- Les actions de l'un sont visibles par tous
- Parfait pour un copilote réel !

## 🔒 Sécurité

### Réseau Local Uniquement

Par défaut, l'application est accessible **uniquement sur votre réseau local** :
- ✅ Sécurisé pour usage domestique
- ✅ Pas d'exposition à Internet
- ✅ Communication en clair acceptable

### Pour Plus de Sécurité (Optionnel)

1. **Utiliser un réseau WiFi privé** (pas public)
2. **Désactiver l'accès réseau** quand non utilisé :
   ```env
   # Dans .env
   HOST=127.0.0.1  # Local uniquement
   ```
3. **Ajouter HTTPS** (certificat auto-signé)
4. **Ajouter authentification** (mot de passe)

## 🌍 Accès depuis l'Extérieur (Avancé)

⚠️ **Non recommandé** pour des raisons de sécurité, mais possible via :

### Option 1 : VPN
- Installer un VPN sur votre réseau (ex: WireGuard, OpenVPN)
- Se connecter au VPN depuis l'extérieur
- Accéder comme si vous étiez sur le réseau local

### Option 2 : Tunnel SSH
```bash
# Sur le Mac distant
ssh -L 3000:localhost:3000 user@votre-ip-publique
# Puis accéder à http://localhost:3000
```

### Option 3 : Service Cloud (Ngrok, etc.)
```bash
# Sur PC Windows
ngrok http 3000
# Donne une URL publique temporaire
```

## 📊 Performance Réseau

### Latence Typique
- **Ethernet** : 1-5ms
- **WiFi 5GHz** : 5-20ms
- **WiFi 2.4GHz** : 10-50ms

### Bande Passante
- **Mises à jour état** : ~1-2 KB/s
- **Commandes** : <1 KB par commande
- **Total** : <5 KB/s (très léger)

### Recommandations
- ✅ **Ethernet** sur le PC Windows (meilleure stabilité)
- ✅ **WiFi 5GHz** pour le Mac (si disponible)
- ⚠️ **WiFi 2.4GHz** acceptable mais peut avoir plus de latence

## 💡 Astuces

1. **Créer un signet** sur votre Mac avec l'URL du serveur
2. **Ajouter à l'écran d'accueil** sur iPad/iPhone (comme une app)
3. **Utiliser un second écran** : Mac pour les contrôles, PC pour MSFS
4. **Mode plein écran** dans le navigateur pour une expérience immersive

## 📝 Checklist de Démarrage

- [ ] MSFS 2024 lancé sur PC Windows
- [ ] Vol actif chargé
- [ ] Pare-feu Windows configuré
- [ ] Application démarrée (`npm start`)
- [ ] IP du serveur notée
- [ ] Mac connecté au même réseau
- [ ] Navigateur ouvert sur l'IP du serveur
- [ ] Indicateur "Connecté" en vert
- [ ] Test d'une commande réussi

---

**Besoin d'aide ?** Consultez les logs du serveur (terminal Windows) et de la console navigateur (F12 sur Mac) pour diagnostiquer les problèmes.