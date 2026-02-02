// Initialize i18n on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    i18n.updatePage();
    
    // Setup language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            i18n.setLanguage(lang);
            
            // Update active state
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Set initial active language button
    const currentLang = i18n.getLanguage();
    document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
    
    // Setup tabs
    initializeTabs();
});

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
}

// Main Application Logic

// Update connection status indicator
function updateConnectionStatus(connected) {
    const statusIndicator = document.getElementById('simconnect-status');
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusIndicator.classList.add('connected');
        statusIndicator.classList.remove('disconnected');
        statusText.textContent = i18n.t('websocketConnected');
    } else {
        statusIndicator.classList.add('disconnected');
        statusIndicator.classList.remove('connected');
        statusText.textContent = i18n.t('websocketDisconnected');
    }
}

// Update SimConnect status
function updateSimConnectStatus(connected) {
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusText.textContent = i18n.t('msfsConnected');
        statusText.style.color = 'var(--success-color)';
    } else {
        statusText.textContent = i18n.t('msfsDisconnected');
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
        
        // Update map coordinates if available
        if (state.aircraft.latitude !== undefined && state.aircraft.longitude !== undefined) {
            updateMapCoordinates(state.aircraft);
        }
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
        const gearStatus = state.gear.position > 0.5 ? i18n.t('down') : i18n.t('up');
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

    // Update fuel display
    if (state.fuel) {
        updateFuelDisplay(state.fuel);
    }

    // Update engines display
    if (state.engines) {
        updateEnginesDisplay(state.engines);
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
        element.textContent = isOn ? i18n.t('running') : i18n.t('stopped');
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
        logActivity(i18n.t('autopilotToggled'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorAutopilot'), 'error');
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
        logActivity(`${i18n.t('altitudeSet')}: ${altitude} ft`, 'success');
        input.value = '';
    } catch (error) {
        logActivity(i18n.t('errorAutopilot'), 'error');
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
        logActivity(`${i18n.t('headingSet')}: ${heading}°`, 'success');
        input.value = '';
    } catch (error) {
        logActivity(i18n.t('errorAutopilot'), 'error');
    }
}

async function toggleNavMode() {
    try {
        await apiCall('/api/autopilot/nav');
        logActivity(i18n.t('navModeToggled'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorAutopilot'), 'error');
    }
}

async function toggleApproachMode() {
    try {
        await apiCall('/api/autopilot/approach');
        logActivity(i18n.t('approachModeToggled'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorAutopilot'), 'error');
    }
}

// Lights functions
async function toggleLight(type) {
    try {
        await apiCall(`/api/lights/${type}`);
        logActivity(`${i18n.t('lightToggled')}: ${type}`, 'success');
    } catch (error) {
        logActivity(i18n.t('errorLights'), 'error');
    }
}

async function allLightsOn() {
    try {
        await apiCall('/api/lights/all/on');
        logActivity(i18n.t('allLightsOn'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorLights'), 'error');
    }
}

async function allLightsOff() {
    try {
        await apiCall('/api/lights/all/off');
        logActivity(i18n.t('allLightsOff'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorLights'), 'error');
    }
}

// Gear functions
async function toggleGear() {
    try {
        await apiCall('/api/gear/toggle');
        logActivity(i18n.t('gearToggled'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorGear'), 'error');
    }
}

async function setGearDown() {
    try {
        await apiCall('/api/gear/down');
        logActivity(i18n.t('gearExtended'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorGear'), 'error');
    }
}

async function setGearUp() {
    try {
        await apiCall('/api/gear/up');
        logActivity(i18n.t('gearRetracted'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorGear'), 'error');
    }
}

// Fuel Alert System
class FuelAlertSystem {
    constructor() {
        this.lastAlert = null;
        this.alertThresholds = {
            critical: 10,  // 10% = critique
            low: 20,       // 20% = bas
            warning: 30    // 30% = attention
        };
        this.alertShown = false;
    }

    checkFuelLevel(fuelData) {
        if (!fuelData || fuelData.total_capacity === 0) return;

        const percentage = (fuelData.total_quantity / fuelData.total_capacity) * 100;

        if (percentage < this.alertThresholds.critical && this.lastAlert !== 'critical') {
            this.showAlert(`⚠️ ${i18n.t('fuelCritical')}`, 'danger');
            this.lastAlert = 'critical';
            logActivity(i18n.t('fuelAlertCritical'), 'error');
        } else if (percentage < this.alertThresholds.low && this.lastAlert !== 'low') {
            this.showAlert(`⚠️ ${i18n.t('fuelLow')}`, 'warning');
            this.lastAlert = 'low';
            logActivity(i18n.t('fuelAlertLow'), 'voice');
        } else if (percentage >= this.alertThresholds.warning) {
            this.lastAlert = null; // Reset when fuel is good
        }

        // Autonomie < 30 minutes
        if (fuelData.remaining_time < 30 && fuelData.remaining_time > 0 && !this.alertShown) {
            this.showAlert(`⏱️ ${i18n.t('fuelEndurance')} ${Math.floor(fuelData.remaining_time)} ${i18n.t('minutes')}`, 'warning');
            this.alertShown = true;
            setTimeout(() => { this.alertShown = false; }, 60000); // Reset after 1 minute
        }
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.fuel-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `fuel-alert ${type}`;
        alert.innerHTML = `
            <span class="alert-icon">${type === 'danger' ? '🚨' : '⚠️'}</span>
            <span class="alert-message">${message}</span>
        `;
        document.body.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

const fuelAlerts = new FuelAlertSystem();

// Update fuel display
function updateFuelDisplay(fuelData) {
    if (!fuelData) return;

    const percentage = fuelData.total_capacity > 0 
        ? (fuelData.total_quantity / fuelData.total_capacity) * 100 
        : 0;

    // Update fuel bar
    const fuelBar = document.getElementById('fuel-bar');
    const fuelPercentage = document.getElementById('fuel-percentage');
    
    if (fuelBar) {
        fuelBar.style.width = `${percentage}%`;
        fuelBar.classList.remove('low', 'critical');
        
        if (percentage < 10) {
            fuelBar.classList.add('critical');
        } else if (percentage < 20) {
            fuelBar.classList.add('low');
        }
    }

    if (fuelPercentage) {
        fuelPercentage.textContent = `${percentage.toFixed(0)}%`;
    }

    // Update fuel values
    updateElement('fuel-quantity', 
        `${fuelData.total_quantity.toFixed(1)} / ${fuelData.total_capacity.toFixed(0)} gal`);
    updateElement('fuel-weight', 
        `${fuelData.total_weight.toFixed(0)} lbs`);
    updateElement('fuel-flow', 
        `${fuelData.flow_rate.toFixed(1)} GPH`);

    // Update endurance
    const hours = Math.floor(fuelData.remaining_time / 60);
    const minutes = Math.floor(fuelData.remaining_time % 60);
    updateElement('fuel-endurance', `${hours}h ${minutes}m`);

    // Check for alerts
    fuelAlerts.checkFuelLevel(fuelData);
}

// Update engines display
function updateEnginesDisplay(enginesData) {
    if (!enginesData) return;

    const container = document.getElementById('engines-container');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // If no engines, show message
    if (enginesData.count === 0) {
        container.innerHTML = `<p class="no-data">${i18n.t('noEngineDetected')}</p>`;
        return;
    }

    // Create engine displays
    for (let i = 1; i <= enginesData.count; i++) {
        const engine = enginesData[`engine${i}`];
        if (!engine) continue;

        const engineDiv = document.createElement('div');
        engineDiv.className = `engine-item ${engine.running ? '' : 'off'}`;
        engineDiv.innerHTML = `
            <div class="engine-header">
                <h4>${i18n.t('engine')} ${i}</h4>
                <span class="engine-status ${engine.running ? 'running' : 'stopped'}">
                    ${engine.running ? i18n.t('running') : i18n.t('stopped')}
                </span>
            </div>
            <div class="engine-params">
                <div class="info-item">
                    <span class="label">RPM:</span>
                    <span class="value">${engine.rpm.toFixed(0)}</span>
                </div>
                <div class="info-item">
                    <span class="label">N1:</span>
                    <span class="value">${engine.n1.toFixed(1)}%</span>
                </div>
                <div class="info-item">
                    <span class="label">N2:</span>
                    <span class="value">${engine.n2.toFixed(1)}%</span>
                </div>
                <div class="info-item">
                    <span class="label">EGT:</span>
                    <span class="value">${engine.egt.toFixed(0)}°C</span>
                </div>
                <div class="info-item">
                    <span class="label">Oil T:</span>
                    <span class="value">${engine.oil_temp.toFixed(0)}°C</span>
                </div>
                <div class="info-item">
                    <span class="label">Oil P:</span>
                    <span class="value">${engine.oil_pressure.toFixed(1)} PSI</span>
                </div>
                <div class="info-item">
                    <span class="label">${i18n.t('fuel')}:</span>
                    <span class="value">${engine.fuel_flow.toFixed(1)} GPH</span>
                </div>
            </div>
        `;
        container.appendChild(engineDiv);
    }
}

// Flaps functions
async function setFlaps(position) {
    try {
        await apiCall('/api/flaps/set', 'POST', { position });
        logActivity(`${i18n.t('flapsSet')}: ${position}%`, 'success');
    } catch (error) {
        logActivity(i18n.t('errorFlaps'), 'error');
    }
}

async function increaseFlaps() {
    try {
        await apiCall('/api/flaps/increase');
        logActivity(i18n.t('flapsSet'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorFlaps'), 'error');
    }
}

async function decreaseFlaps() {
    try {
        await apiCall('/api/flaps/decrease');
        logActivity(i18n.t('flapsSet'), 'success');
    } catch (error) {
        logActivity(i18n.t('errorFlaps'), 'error');
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


// Map Coordinates Update
function updateMapCoordinates(aircraftData) {
    if (!aircraftData) return;
    
    // Update latitude
    const lat = aircraftData.latitude || 0;
    updateElement('map-latitude', `${lat.toFixed(4)}°`);
    
    // Update longitude
    const lon = aircraftData.longitude || 0;
    updateElement('map-longitude', `${lon.toFixed(4)}°`);
    
    // Update ground speed
    const groundSpeed = aircraftData.ground_speed || aircraftData.airspeed || 0;
    updateElement('map-ground-speed', `${Math.round(groundSpeed)} kts`);
    
    // Update track
    const track = aircraftData.track || aircraftData.heading || 0;
    updateElement('map-track', `${Math.round(track)}°`);
}

// METAR Functions
let currentMetarData = null;

async function fetchMetar() {
    const icaoInput = document.getElementById('icao-input');
    const icao = icaoInput.value.trim().toUpperCase();
    
    if (!icao || icao.length !== 4) {
        showMetarError(i18n.t('invalidICAO') || 'Code ICAO invalide (4 lettres requis)');
        return;
    }
    
    const display = document.getElementById('metar-display');
    display.innerHTML = `
        <div class="metar-loading">
            <div class="loading"></div>
            <p>${i18n.t('loadingMetar') || 'Chargement des données METAR...'}</p>
        </div>
    `;
    
    try {
        // Using our local proxy endpoint to avoid CORS issues
        const response = await fetch(`/api/metar/${icao}`);
        
        if (!response.ok) {
            throw new Error('METAR data not available');
        }
        
        const data = await response.json();
        
        if (!data || data.error) {
            throw new Error(data.error || 'No METAR data found for this airport');
        }
        
        currentMetarData = data;
        displayMetar(currentMetarData);
        logActivity(`METAR récupéré pour ${icao}`, 'success');
        
    } catch (error) {
        console.error('METAR fetch error:', error);
        showMetarError(i18n.t('metarError') || `Impossible de récupérer le METAR pour ${icao}. Vérifiez le code ICAO.`);
        logActivity(`Erreur METAR: ${icao}`, 'error');
    }
}

function displayMetar(data) {
    const display = document.getElementById('metar-display');
    
    // Debug: log the received data
    console.log('METAR data received:', data);
    
    // METAR-TAF.com API returns the raw METAR string
    const metarRaw = data.metar || data.raw || 'N/A';
    
    // Parse basic info from raw METAR (simple parsing)
    const parts = metarRaw.split(' ');
    const icao = parts[0] || 'Unknown';
    
    // Simple METAR parsing
    let windInfo = 'N/A';
    let visibility = 'N/A';
    let temp = 'N/A';
    let dewpoint = 'N/A';
    let pressure = 'N/A';
    let clouds = 'Clear';
    
    // Find wind (format: 27015KT or 27015G25KT)
    const windMatch = metarRaw.match(/(\d{3})(\d{2,3})(G(\d{2,3}))?KT/);
    if (windMatch) {
        const dir = windMatch[1];
        const speed = windMatch[2];
        const gust = windMatch[4];
        windInfo = `${dir}° ${speed}kt${gust ? ` G${gust}kt` : ''}`;
    } else if (metarRaw.includes('VRB')) {
        const vrbMatch = metarRaw.match(/VRB(\d{2})KT/);
        if (vrbMatch) {
            windInfo = `Variable ${vrbMatch[1]}kt`;
        }
    }
    
    // Find visibility (format: 9999 or 10SM)
    const visMatch = metarRaw.match(/\s(\d{4})\s/);
    if (visMatch) {
        const visMeters = parseInt(visMatch[1]);
        visibility = visMeters >= 9999 ? '10+ km' : `${(visMeters / 1000).toFixed(1)} km`;
    } else {
        const visSMMatch = metarRaw.match(/(\d+)SM/);
        if (visSMMatch) {
            visibility = `${(parseInt(visSMMatch[1]) * 1.609).toFixed(1)} km`;
        }
    }
    
    // Find temperature/dewpoint (format: 15/08 or M02/M08)
    const tempMatch = metarRaw.match(/(M?\d{2})\/(M?\d{2})/);
    if (tempMatch) {
        temp = tempMatch[1].replace('M', '-') + '°C';
        dewpoint = tempMatch[2].replace('M', '-') + '°C';
    }
    
    // Find pressure (format: Q1013 or A2992)
    const qnhMatch = metarRaw.match(/Q(\d{4})/);
    if (qnhMatch) {
        pressure = `${qnhMatch[1]} hPa`;
    } else {
        const altMatch = metarRaw.match(/A(\d{4})/);
        if (altMatch) {
            const inHg = parseInt(altMatch[1]) / 100;
            pressure = `${(inHg * 33.8639).toFixed(0)} hPa`;
        }
    }
    
    // Find clouds (FEW, SCT, BKN, OVC)
    const cloudMatches = metarRaw.match(/(FEW|SCT|BKN|OVC)(\d{3})/g);
    if (cloudMatches && cloudMatches.length > 0) {
        clouds = cloudMatches.map(c => {
            const type = c.substring(0, 3);
            const alt = c.substring(3);
            return `${type} ${parseInt(alt) * 100}ft`;
        }).join(', ');
    } else if (metarRaw.includes('CAVOK') || metarRaw.includes('SKC') || metarRaw.includes('CLR')) {
        clouds = 'Clear';
    }
    
    // Determine wind condition class
    let conditionClass = 'highlight';
    if (windMatch) {
        const speed = parseInt(windMatch[2]);
        const gust = windMatch[4] ? parseInt(windMatch[4]) : 0;
        if (speed > 25 || gust > 35) {
            conditionClass = 'danger';
        } else if (speed > 15 || gust > 25) {
            conditionClass = 'warning';
        }
    }
    
    display.innerHTML = `
        <div class="metar-data">
            <div class="metar-header">
                <h4>${icao} - ${data.station?.name || 'Airport'}</h4>
                <span class="metar-time">${data.time || new Date().toLocaleString()}</span>
            </div>
            
            <div class="metar-raw">
                <div class="metar-raw-text">${metarRaw}</div>
            </div>
            
            <div class="metar-decoded">
                <div class="metar-item ${conditionClass}">
                    <span class="label">${i18n.t('wind') || 'Vent'}</span>
                    <span class="value">${windInfo}</span>
                </div>
                
                <div class="metar-item">
                    <span class="label">${i18n.t('visibility') || 'Visibilité'}</span>
                    <span class="value">${visibility}</span>
                </div>
                
                <div class="metar-item">
                    <span class="label">${i18n.t('temperature') || 'Température'}</span>
                    <span class="value">${temp}</span>
                </div>
                
                <div class="metar-item">
                    <span class="label">${i18n.t('dewpoint') || 'Point de rosée'}</span>
                    <span class="value">${dewpoint}</span>
                </div>
                
                <div class="metar-item">
                    <span class="label">${i18n.t('pressure') || 'Pression'}</span>
                    <span class="value">${pressure}</span>
                </div>
                
                <div class="metar-item">
                    <span class="label">${i18n.t('clouds') || 'Nuages'}</span>
                    <span class="value">${clouds}</span>
                </div>
            </div>
        </div>
    `;
}

function showMetarError(message) {
    const display = document.getElementById('metar-display');
    display.innerHTML = `
        <div class="metar-error">
            <p>❌ ${message}</p>
        </div>
    `;
}

// Nearby Airports (mock data - would need real API integration)
function updateNearbyAirports(latitude, longitude) {
    const nearbyList = document.getElementById('nearby-list');
    
    // This is mock data - in production, you'd call an API to get nearby airports
    const mockAirports = [
        { icao: 'LFPG', name: 'Paris Charles de Gaulle', distance: '15 NM' },
        { icao: 'LFPO', name: 'Paris Orly', distance: '22 NM' },
        { icao: 'LFPB', name: 'Paris Le Bourget', distance: '18 NM' }
    ];
    
    nearbyList.innerHTML = mockAirports.map(airport => `
        <div class="nearby-airport" onclick="selectNearbyAirport('${airport.icao}')">
            <div class="airport-code">${airport.icao}</div>
            <div class="airport-name">${airport.name}</div>
            <div class="airport-distance">📍 ${airport.distance}</div>
        </div>
    `).join('');
}

function selectNearbyAirport(icao) {
    document.getElementById('icao-input').value = icao;
    fetchMetar();
    switchTab('metar');
}

// Allow Enter key to search METAR
document.addEventListener('DOMContentLoaded', () => {
    const icaoInput = document.getElementById('icao-input');
    if (icaoInput) {
        icaoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchMetar();
            }
        });
    }
});
