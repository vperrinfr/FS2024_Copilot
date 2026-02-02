// Internationalization (i18n) System
// Supports French and English

const translations = {
    fr: {
        // Header
        title: "MSFS 2024 Copilot Assistant",
        connecting: "Connexion...",
        websocketConnected: "WebSocket Connecté",
        websocketDisconnected: "WebSocket Déconnecté",
        msfsConnected: "MSFS2024 Connecté ✓",
        msfsDisconnected: "MSFS2024 Déconnecté ✗",

        // Voice Control
        voiceControl: "Commande Vocale",
        pressToSpeak: "Appuyez pour parler",
        listening: "Écoute en cours...",
        commandExamples: "Exemples de commandes :",
        exampleActivateAP: "Active l'autopilote",
        exampleClimbTo: "Monte à 10000 pieds",
        exampleLandingLights: "Allume les lumières d'atterrissage",
        exampleGearDown: "Sors le train",
        exampleFlaps: "Volets 25 pourcent",

        // Cockpit State
        cockpitState: "État du Cockpit",
        aircraft: "Avion",
        altitude: "Altitude:",
        heading: "Cap:",
        airspeed: "Vitesse:",
        verticalSpeed: "Vario:",
        
        // Autopilot
        autopilot: "Autopilote",
        master: "Master:",
        altHold: "Alt Hold:",
        hdgHold: "Hdg Hold:",
        navMode: "Nav Mode:",
        
        // Lights
        lights: "Lumières",
        beacon: "Beacon:",
        strobe: "Strobe:",
        nav: "Nav:",
        landing: "Landing:",
        taxi: "Taxi:",
        
        // Gear & Flaps
        gearFlaps: "Train & Volets",
        gear: "Train:",
        flaps: "Volets:",
        up: "UP",
        down: "DOWN",
        
        // Fuel & Engines
        fuelEngines: "Carburant & Moteurs",
        fuel: "Carburant",
        quantity: "Quantité:",
        weight: "Poids:",
        consumption: "Consommation:",
        endurance: "Autonomie:",
        engines: "Moteurs",
        engine: "Moteur",
        waitingEngineData: "En attente des données moteurs...",
        noEngineDetected: "Aucun moteur détecté",
        running: "ON",
        stopped: "OFF",
        
        // Control Panels
        autopilotControls: "Autopilote",
        toggleAP: "Toggle AP",
        navModeBtn: "Nav Mode",
        approach: "Approach",
        setAlt: "Set Alt",
        setHdg: "Set Hdg",
        
        lightsControls: "Lumières",
        allOn: "All ON",
        allOff: "All OFF",
        
        gearFlapsControls: "Train & Volets",
        toggleGear: "Toggle Gear",
        gearDown: "Gear Down",
        gearUp: "Gear Up",
        
        // Activity Log
        activityLog: "Journal d'Activité",
        
        // Alerts
        fuelCritical: "CRITIQUE: Carburant très faible!",
        fuelLow: "ATTENTION: Carburant faible",
        fuelEndurance: "Autonomie:",
        minutes: "minutes",
        
        // Log messages
        autopilotToggled: "Autopilote basculé",
        altitudeSet: "Altitude réglée",
        headingSet: "Cap réglé",
        navModeToggled: "Mode navigation basculé",
        approachModeToggled: "Mode approche basculé",
        lightToggled: "Lumière basculée",
        allLightsOn: "Toutes lumières allumées",
        allLightsOff: "Toutes lumières éteintes",
        gearToggled: "Train basculé",
        gearExtended: "Train sorti",
        gearRetracted: "Train rentré",
        flapsSet: "Volets réglés",
        error: "Erreur",
        errorAutopilot: "Erreur autopilote",
        errorLights: "Erreur lumières",
        errorGear: "Erreur train",
        errorFlaps: "Erreur volets",
        fuelAlertCritical: "Alerte carburant critique",
        fuelAlertLow: "Alerte carburant faible",
        
        // Map & METAR
        mapTab: "🗺️ Carte",
        metarTab: "🌤️ METAR",
        mapTitle: "Carte de Navigation",
        mapDescription: "Visualisation de votre position et trajectoire",
        latitude: "Latitude:",
        longitude: "Longitude:",
        groundSpeed: "Vitesse sol:",
        track: "Route:",
        mapNote: "🗺️ Intégration carte interactive à venir",
        
        metarSearch: "Recherche METAR",
        searchBtn: "Rechercher",
        metarPlaceholder: "Entrez un code ICAO pour obtenir les informations météo",
        nearbyAirports: "Aéroports à proximité",
        waitingPosition: "En attente de la position...",
        invalidICAO: "Code ICAO invalide (4 lettres requis)",
        loadingMetar: "Chargement des données METAR...",
        metarError: "Impossible de récupérer le METAR. Vérifiez le code ICAO.",
        wind: "Vent",
        visibility: "Visibilité",
        temperature: "Température",
        dewpoint: "Point de rosée",
        pressure: "Pression",
        clouds: "Nuages",
        
        // Footer
        footerText: "MSFS 2024 Copilot Assistant - Contrôlez votre cockpit avec votre voix et des boutons"
    },
    en: {
        // Header
        title: "MSFS 2024 Copilot Assistant",
        connecting: "Connecting...",
        websocketConnected: "WebSocket Connected",
        websocketDisconnected: "WebSocket Disconnected",
        msfsConnected: "MSFS2024 Connected ✓",
        msfsDisconnected: "MSFS2024 Disconnected ✗",

        // Voice Control
        voiceControl: "Voice Control",
        pressToSpeak: "Press to speak",
        listening: "Listening...",
        commandExamples: "Command examples:",
        exampleActivateAP: "Activate autopilot",
        exampleClimbTo: "Climb to 10000 feet",
        exampleLandingLights: "Turn on landing lights",
        exampleGearDown: "Gear down",
        exampleFlaps: "Flaps 25 percent",

        // Cockpit State
        cockpitState: "Cockpit State",
        aircraft: "Aircraft",
        altitude: "Altitude:",
        heading: "Heading:",
        airspeed: "Airspeed:",
        verticalSpeed: "V/S:",
        
        // Autopilot
        autopilot: "Autopilot",
        master: "Master:",
        altHold: "Alt Hold:",
        hdgHold: "Hdg Hold:",
        navMode: "Nav Mode:",
        
        // Lights
        lights: "Lights",
        beacon: "Beacon:",
        strobe: "Strobe:",
        nav: "Nav:",
        landing: "Landing:",
        taxi: "Taxi:",
        
        // Gear & Flaps
        gearFlaps: "Gear & Flaps",
        gear: "Gear:",
        flaps: "Flaps:",
        up: "UP",
        down: "DOWN",
        
        // Fuel & Engines
        fuelEngines: "Fuel & Engines",
        fuel: "Fuel",
        quantity: "Quantity:",
        weight: "Weight:",
        consumption: "Consumption:",
        endurance: "Endurance:",
        engines: "Engines",
        engine: "Engine",
        waitingEngineData: "Waiting for engine data...",
        noEngineDetected: "No engine detected",
        running: "ON",
        stopped: "OFF",
        
        // Control Panels
        autopilotControls: "Autopilot",
        toggleAP: "Toggle AP",
        navModeBtn: "Nav Mode",
        approach: "Approach",
        setAlt: "Set Alt",
        setHdg: "Set Hdg",
        
        lightsControls: "Lights",
        allOn: "All ON",
        allOff: "All OFF",
        
        gearFlapsControls: "Gear & Flaps",
        toggleGear: "Toggle Gear",
        gearDown: "Gear Down",
        gearUp: "Gear Up",
        
        // Activity Log
        activityLog: "Activity Log",
        
        // Alerts
        fuelCritical: "CRITICAL: Fuel very low!",
        fuelLow: "WARNING: Fuel low",
        fuelEndurance: "Endurance:",
        minutes: "minutes",
        
        // Log messages
        autopilotToggled: "Autopilot toggled",
        altitudeSet: "Altitude set",
        headingSet: "Heading set",
        navModeToggled: "Nav mode toggled",
        approachModeToggled: "Approach mode toggled",
        lightToggled: "Light toggled",
        allLightsOn: "All lights on",
        allLightsOff: "All lights off",
        gearToggled: "Gear toggled",
        gearExtended: "Gear extended",
        gearRetracted: "Gear retracted",
        flapsSet: "Flaps set",
        error: "Error",
        errorAutopilot: "Autopilot error",
        errorLights: "Lights error",
        errorGear: "Gear error",
        errorFlaps: "Flaps error",
        fuelAlertCritical: "Critical fuel alert",
        fuelAlertLow: "Low fuel alert",
        
        // Map & METAR
        mapTab: "🗺️ Map",
        metarTab: "🌤️ METAR",
        mapTitle: "Navigation Map",
        mapDescription: "Visualization of your position and trajectory",
        latitude: "Latitude:",
        longitude: "Longitude:",
        groundSpeed: "Ground Speed:",
        track: "Track:",
        mapNote: "🗺️ Interactive map integration coming soon",
        
        metarSearch: "METAR Search",
        searchBtn: "Search",
        metarPlaceholder: "Enter an ICAO code to get weather information",
        nearbyAirports: "Nearby Airports",
        waitingPosition: "Waiting for position...",
        invalidICAO: "Invalid ICAO code (4 letters required)",
        loadingMetar: "Loading METAR data...",
        metarError: "Unable to retrieve METAR. Check the ICAO code.",
        wind: "Wind",
        visibility: "Visibility",
        temperature: "Temperature",
        dewpoint: "Dewpoint",
        pressure: "Pressure",
        clouds: "Clouds",
        
        // Footer
        footerText: "MSFS 2024 Copilot Assistant - Control your cockpit with voice and buttons"
    }
};

class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'fr';
        this.translations = translations;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updatePage();
            // Update voice recognition language
            if (window.voiceRecognition) {
                window.voiceRecognition.setLanguage(lang);
            }
            // Update voice button text
            const voiceBtn = document.getElementById('voice-btn-text');
            if (voiceBtn) {
                voiceBtn.textContent = this.t('pressToSpeak');
            }
        }
    }

    getLanguage() {
        return this.currentLanguage;
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    updatePage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Trigger custom event for dynamic content updates
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLanguage } 
        }));
    }
}

// Create global instance
const i18n = new I18n();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

// Made with Bob
