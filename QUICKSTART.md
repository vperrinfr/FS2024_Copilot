# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### 1️⃣ Installer les dépendances
```bash
npm install
```

### 2️⃣ Lancer MSFS 2024
- Démarrez Microsoft Flight Simulator 2024
- Chargez un vol (n'importe quel avion)

### 3️⃣ Démarrer l'application
```bash
npm start
```

Ouvrez votre navigateur : **http://localhost:3000**

## ✅ Vérification

Vous devriez voir :
- ✓ Indicateur "MSFS2024 Connecté" en vert
- ✓ Tableau de bord avec les données de vol
- ✓ Bouton "Appuyez pour parler" actif

## 🎤 Première Commande Vocale

1. Cliquez sur **"Appuyez pour parler"** (ou touche V)
2. Attendez que le bouton devienne vert
3. Dites : **"Allume beacon"**
4. Vérifiez que la lumière beacon s'allume dans MSFS

## 🎮 Premiers Tests

### Test Autopilote
- Dites : **"Active l'autopilote"**
- Vérifiez l'indicateur "Master: ON"

### Test Lumières
- Cliquez sur le bouton **"Beacon"**
- Ou dites : **"Allume beacon"**

### Test Train
- Appuyez sur la touche **G**
- Ou dites : **"Sors le train"**

## ❓ Problèmes ?

### SimConnect ne se connecte pas
```bash
# Vérifiez que MSFS est lancé et en vol
# Redémarrez l'application
npm start
```

### Reconnaissance vocale ne marche pas
- Utilisez Chrome ou Edge
- Autorisez l'accès au microphone
- Vérifiez que votre micro fonctionne

## 📚 Documentation Complète

Consultez [README.md](README.md) pour :
- Liste complète des commandes vocales
- Documentation de l'API REST
- Dépannage avancé
- Architecture du projet

## 🎯 Commandes Vocales Essentielles

| Commande | Action |
|----------|--------|
| "Active l'autopilote" | Active/désactive l'AP |
| "Monte à 10000 pieds" | Règle l'altitude |
| "Cap 270" | Règle le cap |
| "Allume beacon" | Allume la lumière beacon |
| "Sors le train" | Sort le train d'atterrissage |
| "Volets 25 pourcent" | Règle les volets à 25% |
| "Aide" | Affiche l'aide |

---

**Bon vol ! ✈️**