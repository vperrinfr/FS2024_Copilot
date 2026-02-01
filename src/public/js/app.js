// Main Application Logic

// Update connection status indicator
function updateConnectionStatus(connected) {
    const statusIndicator = document.getElementById('simconnect-status');
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusIndicator.classList.add('connected');
        statusIndicator.classList.remove('disconnected');
        statusText.textContent = 'WebSocket Connecté';
    } else {
        statusIndicator.classList.add('disconnected');
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'WebSocket Déconnecté';
    }
}

// Update SimConnect status
function updateSimConnectStatus(connected) {
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusText.textContent = 'MSFS2024 Connecté ✓';
        statusText.style.color = 'var(--success-color)';
    } else {
        statusText.textContent = 'MSFS2024 Déconnecté ✗';
        statusText.style.color = 'var(--danger-color)';
    }
}

// Update cockpit state display
function updateCockpitState(state) {
    if (!state) return;

    // Update aircraft info
    if (state.aircraft) {
        updateElement('altitude', `${Math.round(state.aircraft.altitude)} ft`);
        updateElement('heading', `${Math.round(state.aircraft.heading)}°`);
        updateElement('airspeed', `${Math.round(state.aircraft.airspeed)} kts`);
        updateElement('vertical-speed', `${Math.round(state.aircraft.vertical_speed * 60)} fpm`);
    }

    // Update autopilot status
    if (state.autopilot) {
        updateIndicator('ap-master', state.autopilot.master);
        updateIndicator('ap-alt', state.autopilot.altitude_hold);
        updateIndicator('ap-hdg', state.autopilot.heading_hold);
        updateIndicator('ap-nav', state.autopilot.nav_mode);
    }

    // Update lights status
    if (state.lights) {
        updateIndicator('light-beacon', state.lights.beacon);
        updateIndicator('light-strobe', state.lights.strobe);
        updateIndicator('light-nav', state.lights.nav);
        updateIndicator('light-landing', state.lights.landing);
        updateIndicator('light-taxi', state.lights.taxi);
    }

    // Update gear status
    if (state.gear) {
        const gearStatus = state.gear.position > 0.5 ? 'DOWN' : 'UP';
        updateElement('gear-status', gearStatus);
        const gearIndicator = document.getElementById('gear-status');
        if (gearIndicator) {
            gearIndicator.classList.toggle('on', state.gear.position > 0.5);
            gearIndicator.classList.toggle('off', state.gear.position <= 0.5);
        }
    }

    // Update flaps status
    if (state.flaps) {
        const flapsPercent = Math.round(state.flaps.position);
        updateElement('flaps-status', `${flapsPercent}%`);
        const flapsIndicator = document.getElementById('flaps-status');
        if (flapsIndicator) {
            flapsIndicator.classList.toggle('on', flapsPercent > 0);
            flapsIndicator.classList.toggle('off', flapsPercent === 0);
        }
    }
}

// Helper function to update element text
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Helper function to update indicator status
function updateIndicator(id, isOn) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = isOn ? 'ON' : 'OFF';
        element.classList.toggle('on', isOn);
        element.classList.toggle('off', !isOn);
    }
}

// Activity log
function logActivity(message, type = 'info') {
    const logContainer = document.getElementById('activity-log');
    if (!logContainer) return;

    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
        <span class="log-timestamp">${timestamp}</span>
        <span class="log-message">${message}</span>
    `;

    logContainer.insertBefore(entry, logContainer.firstChild);

    // Keep only last 50 entries
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// API call helper
async function apiCall(endpoint, method = 'POST', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(endpoint, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API call failed');
        }

        return result;
    } catch (error) {
        console.error('API call error:', error);
        logActivity(`Erreur API: ${error.message}`, 'error');
        throw error;
    }
}

// Autopilot functions
async function toggleAutopilot() {
    try {
        const result = await apiCall('/api/autopilot/toggle');
        logActivity('Autopilote basculé', 'success');
    } catch (error) {
        logActivity('Erreur autopilote', 'error');
    }
}

async function setAltitude() {
    const input = document.getElementById('altitude-input');
    const altitude = parseInt(input.value);

    if (!altitude || altitude < 0 || altitude > 50000) {
        logActivity('Altitude invalide (0-50000 ft)', 'error');
        return;
    }

    try {
        await apiCall('/api/autopilot/altitude', 'POST', { altitude });
        logActivity(`Altitude réglée: ${altitude} ft`, 'success');
        input.value = '';
    } catch (error) {
        logActivity('Erreur réglage altitude', 'error');
    }
}

async function setHeading() {
    const input = document.getElementById('heading-input');
    const heading = parseInt(input.value);

    if (heading === undefined || heading < 0 || heading > 360) {
        logActivity('Cap invalide (0-360°)', 'error');
        return;
    }

    try {
        await apiCall('/api/autopilot/heading', 'POST', { heading });
        logActivity(`Cap réglé: ${heading}°`, 'success');
        input.value = '';
    } catch (error) {
        logActivity('Erreur réglage cap', 'error');
    }
}

async function toggleNavMode() {
    try {
        await apiCall('/api/autopilot/nav');
        logActivity('Mode NAV basculé', 'success');
    } catch (error) {
        logActivity('Erreur mode NAV', 'error');
    }
}

async function toggleApproachMode() {
    try {
        await apiCall('/api/autopilot/approach');
        logActivity('Mode approche basculé', 'success');
    } catch (error) {
        logActivity('Erreur mode approche', 'error');
    }
}

// Lights functions
async function toggleLight(type) {
    try {
        await apiCall(`/api/lights/${type}`);
        logActivity(`Lumière ${type} basculée`, 'success');
    } catch (error) {
        logActivity(`Erreur lumière ${type}`, 'error');
    }
}

async function allLightsOn() {
    try {
        await apiCall('/api/lights/all/on');
        logActivity('Toutes les lumières allumées', 'success');
    } catch (error) {
        logActivity('Erreur lumières', 'error');
    }
}

async function allLightsOff() {
    try {
        await apiCall('/api/lights/all/off');
        logActivity('Toutes les lumières éteintes', 'success');
    } catch (error) {
        logActivity('Erreur lumières', 'error');
    }
}

// Gear functions
async function toggleGear() {
    try {
        await apiCall('/api/gear/toggle');
        logActivity('Train basculé', 'success');
    } catch (error) {
        logActivity('Erreur train', 'error');
    }
}

async function setGearDown() {
    try {
        await apiCall('/api/gear/down');
        logActivity('Train sorti', 'success');
    } catch (error) {
        logActivity('Erreur train', 'error');
    }
}

async function setGearUp() {
    try {
        await apiCall('/api/gear/up');
        logActivity('Train rentré', 'success');
    } catch (error) {
        logActivity('Erreur train', 'error');
    }
}

// Flaps functions
async function setFlaps(position) {
    try {
        await apiCall('/api/flaps/set', 'POST', { position });
        logActivity(`Volets réglés: ${position}%`, 'success');
    } catch (error) {
        logActivity('Erreur volets', 'error');
    }
}

async function increaseFlaps() {
    try {
        await apiCall('/api/flaps/increase');
        logActivity('Volets augmentés', 'success');
    } catch (error) {
        logActivity('Erreur volets', 'error');
    }
}

async function decreaseFlaps() {
    try {
        await apiCall('/api/flaps/decrease');
        logActivity('Volets diminués', 'success');
    } catch (error) {
        logActivity('Erreur volets', 'error');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Only trigger if not in an input field
    if (event.target.tagName === 'INPUT') return;

    switch (event.key.toLowerCase()) {
        case 'v':
            // V key for voice
            if (!event.ctrlKey && !event.altKey) {
                voiceRecognition.start();
            }
            break;
        case 'g':
            // G key for gear
            if (!event.ctrlKey && !event.altKey) {
                toggleGear();
            }
            break;
        case 'a':
            // A key for autopilot
            if (!event.ctrlKey && !event.altKey) {
                toggleAutopilot();
            }
            break;
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('MSFS Copilot Assistant initialized');
    logActivity('Application démarrée', 'success');

    // Request initial state after a short delay
    setTimeout(() => {
        if (wsClient.isConnected()) {
            wsClient.requestState();
        }
    }, 1000);
});

// Show keyboard shortcuts info
console.log(`
╔════════════════════════════════════════════╗
║     Raccourcis Clavier                     ║
╠════════════════════════════════════════════╣
║  V - Commande vocale                       ║
║  G - Toggle train d'atterrissage           ║
║  A - Toggle autopilote                     ║
╚════════════════════════════════════════════╝
`);

// Made with Bob
