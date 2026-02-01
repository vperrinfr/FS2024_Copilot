# 📡 Exemples d'Utilisation de l'API

Ce document fournit des exemples pratiques d'utilisation de l'API REST du MSFS Copilot Assistant.

## Base URL

```
http://localhost:3000/api
```

## Authentification

Aucune authentification n'est requise pour le moment (application locale).

---

## 🔍 Endpoints de Statut

### Vérifier la Santé du Serveur

```bash
curl http://localhost:3000/api/health
```

**Réponse:**
```json
{
  "status": "ok",
  "simconnect": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Obtenir l'État du Cockpit

```bash
curl http://localhost:3000/api/status
```

**Réponse:**
```json
{
  "connected": true,
  "state": {
    "autopilot": {
      "master": false,
      "altitude_hold": false,
      "heading_hold": false,
      "nav_mode": false,
      "approach_mode": false,
      "target_altitude": 0,
      "target_heading": 0
    },
    "lights": {
      "beacon": false,
      "strobe": false,
      "nav": false,
      "landing": false,
      "taxi": false
    },
    "gear": {
      "position": 1
    },
    "flaps": {
      "position": 0
    },
    "aircraft": {
      "altitude": 5000,
      "heading": 270,
      "airspeed": 150,
      "vertical_speed": 0
    }
  }
}
```

---

## 🤖 Autopilote

### Toggle Autopilote

```bash
curl -X POST http://localhost:3000/api/autopilot/toggle
```

**Réponse:**
```json
{
  "success": true,
  "action": "autopilot_toggle"
}
```

### Régler l'Altitude

```bash
curl -X POST http://localhost:3000/api/autopilot/altitude \
  -H "Content-Type: application/json" \
  -d '{"altitude": 10000}'
```

**Réponse:**
```json
{
  "success": true,
  "action": "altitude_hold",
  "altitude": 10000
}
```

### Régler le Cap

```bash
curl -X POST http://localhost:3000/api/autopilot/heading \
  -H "Content-Type: application/json" \
  -d '{"heading": 270}'
```

**Réponse:**
```json
{
  "success": true,
  "action": "heading_hold",
  "heading": 270
}
```

### Activer le Mode NAV

```bash
curl -X POST http://localhost:3000/api/autopilot/nav
```

**Réponse:**
```json
{
  "success": true,
  "action": "nav_mode"
}
```

### Activer le Mode Approche

```bash
curl -X POST http://localhost:3000/api/autopilot/approach
```

**Réponse:**
```json
{
  "success": true,
  "action": "approach_mode"
}
```

---

## 💡 Lumières

### Toggle une Lumière Spécifique

```bash
# Beacon
curl -X POST http://localhost:3000/api/lights/beacon

# Strobe
curl -X POST http://localhost:3000/api/lights/strobe

# Navigation
curl -X POST http://localhost:3000/api/lights/nav

# Landing
curl -X POST http://localhost:3000/api/lights/landing

# Taxi
curl -X POST http://localhost:3000/api/lights/taxi
```

**Réponse:**
```json
{
  "success": true,
  "action": "light_beacon"
}
```

### Allumer Toutes les Lumières

```bash
curl -X POST http://localhost:3000/api/lights/all/on
```

**Réponse:**
```json
{
  "success": true,
  "action": "all_lights_on",
  "results": [
    {"light": "beacon", "success": true},
    {"light": "strobe", "success": true},
    {"light": "nav", "success": true},
    {"light": "landing", "success": true},
    {"light": "taxi", "success": true}
  ]
}
```

### Éteindre Toutes les Lumières

```bash
curl -X POST http://localhost:3000/api/lights/all/off
```

---

## ⚙️ Train d'Atterrissage

### Toggle Train

```bash
curl -X POST http://localhost:3000/api/gear/toggle
```

**Réponse:**
```json
{
  "success": true,
  "action": "gear_toggle"
}
```

### Sortir le Train

```bash
curl -X POST http://localhost:3000/api/gear/down
```

**Réponse:**
```json
{
  "success": true,
  "action": "gear_down"
}
```

### Rentrer le Train

```bash
curl -X POST http://localhost:3000/api/gear/up
```

**Réponse:**
```json
{
  "success": true,
  "action": "gear_up"
}
```

---

## 🛬 Volets

### Régler les Volets à une Position

```bash
# Volets 0%
curl -X POST http://localhost:3000/api/flaps/set \
  -H "Content-Type: application/json" \
  -d '{"position": 0}'

# Volets 25%
curl -X POST http://localhost:3000/api/flaps/set \
  -H "Content-Type: application/json" \
  -d '{"position": 25}'

# Volets 50%
curl -X POST http://localhost:3000/api/flaps/set \
  -H "Content-Type: application/json" \
  -d '{"position": 50}'

# Volets 100%
curl -X POST http://localhost:3000/api/flaps/set \
  -H "Content-Type: application/json" \
  -d '{"position": 100}'
```

**Réponse:**
```json
{
  "success": true,
  "action": "flaps_set",
  "position": 25
}
```

### Augmenter les Volets

```bash
curl -X POST http://localhost:3000/api/flaps/increase
```

**Réponse:**
```json
{
  "success": true,
  "action": "flaps_increase"
}
```

### Diminuer les Volets

```bash
curl -X POST http://localhost:3000/api/flaps/decrease
```

**Réponse:**
```json
{
  "success": true,
  "action": "flaps_decrease"
}
```

---

## 📻 Radio

### Changer une Fréquence Radio

```bash
# COM1
curl -X POST http://localhost:3000/api/radio/com1 \
  -H "Content-Type: application/json" \
  -d '{"frequency": 118.50}'

# COM2
curl -X POST http://localhost:3000/api/radio/com2 \
  -H "Content-Type: application/json" \
  -d '{"frequency": 119.25}'

# NAV1
curl -X POST http://localhost:3000/api/radio/nav1 \
  -H "Content-Type: application/json" \
  -d '{"frequency": 110.50}'

# NAV2
curl -X POST http://localhost:3000/api/radio/nav2 \
  -H "Content-Type: application/json" \
  -d '{"frequency": 112.75}'
```

**Réponse:**
```json
{
  "success": true,
  "action": "radio_com1",
  "frequency": 118.50
}
```

---

## 🎤 Commande Vocale

### Envoyer une Commande Vocale

```bash
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{"command": "active l'\''autopilote"}'
```

**Réponse:**
```json
{
  "success": true,
  "command": "active l'autopilote",
  "message": "Command received and will be processed"
}
```

---

## 🐍 Exemples Python

### Script Python Complet

```python
import requests
import json

BASE_URL = "http://localhost:3000/api"

class MSFSCopilot:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
    
    def get_status(self):
        """Obtenir l'état du cockpit"""
        response = requests.get(f"{self.base_url}/status")
        return response.json()
    
    def toggle_autopilot(self):
        """Toggle autopilote"""
        response = requests.post(f"{self.base_url}/autopilot/toggle")
        return response.json()
    
    def set_altitude(self, altitude):
        """Régler l'altitude"""
        response = requests.post(
            f"{self.base_url}/autopilot/altitude",
            json={"altitude": altitude}
        )
        return response.json()
    
    def set_heading(self, heading):
        """Régler le cap"""
        response = requests.post(
            f"{self.base_url}/autopilot/heading",
            json={"heading": heading}
        )
        return response.json()
    
    def toggle_light(self, light_type):
        """Toggle une lumière"""
        response = requests.post(f"{self.base_url}/lights/{light_type}")
        return response.json()
    
    def set_flaps(self, position):
        """Régler les volets"""
        response = requests.post(
            f"{self.base_url}/flaps/set",
            json={"position": position}
        )
        return response.json()
    
    def gear_down(self):
        """Sortir le train"""
        response = requests.post(f"{self.base_url}/gear/down")
        return response.json()

# Utilisation
copilot = MSFSCopilot()

# Obtenir l'état
status = copilot.get_status()
print(f"Altitude: {status['state']['aircraft']['altitude']} ft")

# Activer l'autopilote et régler l'altitude
copilot.toggle_autopilot()
copilot.set_altitude(10000)

# Allumer les lumières
copilot.toggle_light('beacon')
copilot.toggle_light('strobe')

# Sortir le train
copilot.gear_down()
```

---

## 🟢 Exemples JavaScript/Node.js

### Script Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

class MSFSCopilot {
    constructor(baseUrl = BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async getStatus() {
        const response = await axios.get(`${this.baseUrl}/status`);
        return response.data;
    }

    async toggleAutopilot() {
        const response = await axios.post(`${this.baseUrl}/autopilot/toggle`);
        return response.data;
    }

    async setAltitude(altitude) {
        const response = await axios.post(`${this.baseUrl}/autopilot/altitude`, {
            altitude
        });
        return response.data;
    }

    async setHeading(heading) {
        const response = await axios.post(`${this.baseUrl}/autopilot/heading`, {
            heading
        });
        return response.data;
    }

    async toggleLight(lightType) {
        const response = await axios.post(`${this.baseUrl}/lights/${lightType}`);
        return response.data;
    }

    async setFlaps(position) {
        const response = await axios.post(`${this.baseUrl}/flaps/set`, {
            position
        });
        return response.data;
    }

    async gearDown() {
        const response = await axios.post(`${this.baseUrl}/gear/down`);
        return response.data;
    }
}

// Utilisation
(async () => {
    const copilot = new MSFSCopilot();

    // Obtenir l'état
    const status = await copilot.getStatus();
    console.log(`Altitude: ${status.state.aircraft.altitude} ft`);

    // Activer l'autopilote et régler l'altitude
    await copilot.toggleAutopilot();
    await copilot.setAltitude(10000);

    // Allumer les lumières
    await copilot.toggleLight('beacon');
    await copilot.toggleLight('strobe');

    // Sortir le train
    await copilot.gearDown();
})();
```

---

## ❌ Gestion des Erreurs

### SimConnect Non Connecté

**Requête:**
```bash
curl -X POST http://localhost:3000/api/autopilot/toggle
```

**Réponse (503):**
```json
{
  "error": "SimConnect not connected",
  "message": "Please ensure MSFS2024 is running"
}
```

### Paramètre Invalide

**Requête:**
```bash
curl -X POST http://localhost:3000/api/autopilot/altitude \
  -H "Content-Type: application/json" \
  -d '{"altitude": 99999}'
```

**Réponse (400):**
```json
{
  "error": "Invalid altitude value"
}
```

### Endpoint Inexistant

**Requête:**
```bash
curl http://localhost:3000/api/invalid
```

**Réponse (404):**
```json
{
  "error": "Not found"
}
```

---

## 📊 Codes de Statut HTTP

| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Requête réussie |
| 400 | Bad Request | Paramètres invalides |
| 404 | Not Found | Endpoint inexistant |
| 500 | Internal Server Error | Erreur serveur |
| 503 | Service Unavailable | SimConnect non connecté |

---

## 💡 Conseils d'Utilisation

1. **Vérifier la connexion** avant d'envoyer des commandes :
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Gérer les erreurs** dans votre code client

3. **Utiliser WebSocket** pour les mises à jour temps réel plutôt que du polling

4. **Respecter les limites** des valeurs (altitude, cap, etc.)

5. **Tester localement** avant d'intégrer dans une application

---

**Note**: Tous ces exemples supposent que le serveur tourne sur `localhost:3000`. Ajustez l'URL selon votre configuration.