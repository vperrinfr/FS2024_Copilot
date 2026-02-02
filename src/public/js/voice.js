// Voice Recognition Manager
class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.commands = null;
        this.currentLang = 'fr';
        this.initRecognition();
        this.loadCommands();
    }

    setLanguage(lang) {
        this.currentLang = lang;
        if (this.recognition) {
            this.recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
        }
        this.loadCommands();
    }

    initRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            this.showError('La reconnaissance vocale n\'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.currentLang === 'fr' ? 'fr-FR' : 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            this.isListening = true;
            this.updateUI('listening');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Recognized:', transcript);
            this.updateTranscript(transcript);
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            
            let errorMessage = 'Erreur de reconnaissance vocale';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'Aucune parole détectée';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone non disponible';
                    break;
                case 'not-allowed':
                    errorMessage = 'Permission microphone refusée';
                    break;
            }
            
            this.showError(errorMessage);
            this.updateUI('error');
        };

        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.isListening = false;
            this.updateUI('idle');
        };
    }

    async loadCommands() {
        try {
            const commandFile = this.currentLang === 'fr' ? '/config/commands.json' : '/config/commands-en.json';
            const response = await fetch(commandFile);
            this.commands = await response.json();
            console.log('Voice commands loaded:', this.commands);
        } catch (error) {
            console.error('Failed to load commands:', error);
        }
    }

    start() {
        if (!this.recognition) {
            this.showError('Reconnaissance vocale non disponible');
            return;
        }

        if (this.isListening) {
            this.stop();
            return;
        }

        try {
            this.recognition.start();
            this.showFeedback('Écoute en cours... Parlez maintenant');
        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.showError('Impossible de démarrer la reconnaissance vocale');
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    processCommand(transcript) {
        if (!this.commands) {
            this.showError('Commandes non chargées');
            return;
        }

        let commandFound = false;

        // Check autopilot commands
        if (this.matchCommand(transcript, this.commands.autopilot.activate)) {
            this.executeAction('autopilot', 'toggle');
            commandFound = true;
        } else if (this.matchCommand(transcript, this.commands.autopilot.altitude_hold)) {
            // Extract altitude from command
            const altMatch = transcript.match(/(\d+)\s*(pieds|feet|ft)?/i);
            if (altMatch) {
                const altitude = parseInt(altMatch[1]);
                this.executeAction('autopilot', 'altitude', { altitude });
            } else {
                this.showError('Altitude non reconnue');
            }
            commandFound = true;
        } else if (this.matchCommand(transcript, this.commands.autopilot.heading_hold)) {
            // Extract heading from command
            const hdgMatch = transcript.match(/(\d+)\s*(degrés|degrees)?/i);
            if (hdgMatch) {
                const heading = parseInt(hdgMatch[1]);
                this.executeAction('autopilot', 'heading', { heading });
            } else {
                this.showError('Cap non reconnu');
            }
            commandFound = true;
        } else if (this.matchCommand(transcript, this.commands.autopilot.nav_mode)) {
            this.executeAction('autopilot', 'nav');
            commandFound = true;
        } else if (this.matchCommand(transcript, this.commands.autopilot.approach_mode)) {
            this.executeAction('autopilot', 'approach');
            commandFound = true;
        }

        // Check lights commands
        for (const [light, phrases] of Object.entries(this.commands.lights)) {
            if (this.matchCommand(transcript, phrases)) {
                if (light === 'all_on' || light === 'all_off') {
                    this.executeAction('lights', light);
                } else {
                    this.executeAction('lights', light);
                }
                commandFound = true;
                break;
            }
        }

        // Check gear commands
        if (this.matchCommand(transcript, this.commands.gear.down)) {
            this.executeAction('gear', 'down');
            commandFound = true;
        } else if (this.matchCommand(transcript, this.commands.gear.up)) {
            this.executeAction('gear', 'up');
            commandFound = true;
        }

        // Check flaps commands
        for (const [position, phrases] of Object.entries(this.commands.flaps)) {
            if (this.matchCommand(transcript, phrases)) {
                this.executeAction('flaps', 'set', { position: parseInt(position) });
                commandFound = true;
                break;
            }
        }

        // Check general commands
        if (this.matchCommand(transcript, this.commands.general.help)) {
            this.showHelp();
            commandFound = true;
        } else if (this.matchCommand(transcript, this.commands.general.status)) {
            this.requestStatus();
            commandFound = true;
        }

        if (!commandFound) {
            this.showError(`Commande non reconnue: "${transcript}"`);
            logActivity(`Commande inconnue: "${transcript}"`, 'error');
        }
    }

    matchCommand(transcript, phrases) {
        return phrases.some(phrase => 
            transcript.includes(phrase.toLowerCase())
        );
    }

    async executeAction(category, action, params = {}) {
        let endpoint = '';
        let method = 'POST';
        let body = {};

        switch (category) {
            case 'autopilot':
                if (action === 'toggle') {
                    endpoint = '/api/autopilot/toggle';
                } else if (action === 'altitude') {
                    endpoint = '/api/autopilot/altitude';
                    body = { altitude: params.altitude };
                } else if (action === 'heading') {
                    endpoint = '/api/autopilot/heading';
                    body = { heading: params.heading };
                } else if (action === 'nav') {
                    endpoint = '/api/autopilot/nav';
                } else if (action === 'approach') {
                    endpoint = '/api/autopilot/approach';
                }
                break;

            case 'lights':
                if (action === 'all_on') {
                    endpoint = '/api/lights/all/on';
                } else if (action === 'all_off') {
                    endpoint = '/api/lights/all/off';
                } else {
                    endpoint = `/api/lights/${action}`;
                }
                break;

            case 'gear':
                endpoint = `/api/gear/${action}`;
                break;

            case 'flaps':
                endpoint = '/api/flaps/set';
                body = { position: params.position };
                break;
        }

        if (endpoint) {
            try {
                const response = await fetch(endpoint, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
                });

                const result = await response.json();
                
                if (result.success) {
                    this.showFeedback('✓ Commande exécutée');
                    logActivity(`Commande vocale exécutée: ${action}`, 'success');
                } else {
                    this.showError('✗ Échec de la commande');
                }
            } catch (error) {
                console.error('Error executing action:', error);
                this.showError('Erreur lors de l\'exécution');
            }
        }
    }

    showHelp() {
        const helpText = `
            Commandes disponibles:
            - "Active l'autopilote"
            - "Monte à [altitude] pieds"
            - "Cap [degrés]"
            - "Allume/Éteins [lumière]"
            - "Sors/Rentre le train"
            - "Volets [0/25/50/100]"
        `;
        this.showFeedback(helpText);
    }

    requestStatus() {
        wsClient.requestState();
        this.showFeedback('Mise à jour de l\'état...');
    }

    updateUI(state) {
        const btn = document.getElementById('voice-btn');
        const btnText = document.getElementById('voice-btn-text');
        const feedback = document.getElementById('voice-feedback');

        switch (state) {
            case 'listening':
                btn.classList.add('btn-success');
                btn.classList.remove('btn-primary', 'btn-danger');
                btnText.textContent = 'Écoute en cours...';
                feedback.classList.add('listening');
                feedback.classList.remove('error');
                break;

            case 'error':
                btn.classList.add('btn-danger');
                btn.classList.remove('btn-primary', 'btn-success');
                btnText.textContent = 'Erreur - Réessayer';
                feedback.classList.add('error');
                feedback.classList.remove('listening');
                setTimeout(() => this.updateUI('idle'), 3000);
                break;

            case 'idle':
            default:
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-success', 'btn-danger');
                btnText.textContent = 'Appuyez pour parler';
                feedback.classList.remove('listening', 'error');
                break;
        }
    }

    showFeedback(message) {
        const feedback = document.getElementById('voice-feedback');
        feedback.textContent = message;
    }

    showError(message) {
        const feedback = document.getElementById('voice-feedback');
        feedback.textContent = message;
        feedback.classList.add('error');
    }

    updateTranscript(text) {
        const transcript = document.getElementById('voice-transcript');
        transcript.textContent = `"${text}"`;
    }
}

// Global voice recognition instance
const voiceRecognition = new VoiceRecognition();

// Voice button handler
document.addEventListener('DOMContentLoaded', () => {
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            voiceRecognition.start();
        });
    }
});

// Made with Bob
