const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const SimConnectManager = require('./simconnect');
const WebSocketManager = require('./websocket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize managers
const simConnect = new SimConnectManager();
const wsManager = new WebSocketManager(server, simConnect);

// Connect to MSFS2024 on startup
let connectionAttempts = 0;
const maxAttempts = 5;

async function attemptConnection() {
  connectionAttempts++;
  console.log(`\nAttempt ${connectionAttempts}/${maxAttempts} to connect to MSFS2024...`);
  
  const connected = await simConnect.connect();
  
  if (connected) {
    wsManager.notifySimConnectStatus(true);
    console.log('✓ MSFS Copilot ready!\n');
  } else {
    wsManager.notifySimConnectStatus(false);
    
    if (connectionAttempts < maxAttempts) {
      console.log(`Retrying in 5 seconds...\n`);
      setTimeout(attemptConnection, 5000);
    } else {
      console.log('✗ Failed to connect after maximum attempts.');
      console.log('Please ensure MSFS2024 is running and try restarting the server.\n');
    }
  }
}

// Start connection attempts
attemptConnection();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    simconnect: simConnect.isConnected(),
    timestamp: new Date().toISOString()
  });
});

// Get current cockpit state
app.get('/api/status', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({
      error: 'SimConnect not connected',
      message: 'Please ensure MSFS2024 is running'
    });
  }

  res.json({
    connected: true,
    state: simConnect.getCockpitState()
  });
});

// Autopilot endpoints
app.post('/api/autopilot/toggle', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.toggleAutopilot();
  wsManager.notifyAction('autopilot_toggle', success);
  
  res.json({ success, action: 'autopilot_toggle' });
});

app.post('/api/autopilot/altitude', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const { altitude } = req.body;
  if (!altitude || altitude < 0 || altitude > 50000) {
    return res.status(400).json({ error: 'Invalid altitude value' });
  }

  const success = simConnect.setAltitudeHold(altitude);
  wsManager.notifyAction('altitude_hold', success, { altitude });
  
  res.json({ success, action: 'altitude_hold', altitude });
});

app.post('/api/autopilot/heading', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const { heading } = req.body;
  if (heading === undefined || heading < 0 || heading > 360) {
    return res.status(400).json({ error: 'Invalid heading value' });
  }

  const success = simConnect.setHeadingHold(heading);
  wsManager.notifyAction('heading_hold', success, { heading });
  
  res.json({ success, action: 'heading_hold', heading });
});

app.post('/api/autopilot/nav', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.toggleNavMode();
  wsManager.notifyAction('nav_mode', success);
  
  res.json({ success, action: 'nav_mode' });
});

app.post('/api/autopilot/approach', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.toggleApproachMode();
  wsManager.notifyAction('approach_mode', success);
  
  res.json({ success, action: 'approach_mode' });
});

// Lights endpoints
app.post('/api/lights/:type', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const { type } = req.params;
  const validTypes = ['beacon', 'strobe', 'nav', 'landing', 'taxi'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid light type' });
  }

  const success = simConnect.toggleLight(type);
  wsManager.notifyAction(`light_${type}`, success);
  
  res.json({ success, action: `light_${type}` });
});

app.post('/api/lights/all/:state', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const { state } = req.params;
  if (state !== 'on' && state !== 'off') {
    return res.status(400).json({ error: 'State must be "on" or "off"' });
  }

  const lights = ['beacon', 'strobe', 'nav', 'landing', 'taxi'];
  const results = lights.map(light => ({
    light,
    success: simConnect.toggleLight(light)
  }));

  wsManager.notifyAction(`all_lights_${state}`, true, { results });
  
  res.json({ success: true, action: `all_lights_${state}`, results });
});

// Gear endpoints
app.post('/api/gear/toggle', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.toggleGear();
  wsManager.notifyAction('gear_toggle', success);
  
  res.json({ success, action: 'gear_toggle' });
});

app.post('/api/gear/down', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.setGearDown();
  wsManager.notifyAction('gear_down', success);
  
  res.json({ success, action: 'gear_down' });
});

app.post('/api/gear/up', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.setGearUp();
  wsManager.notifyAction('gear_up', success);
  
  res.json({ success, action: 'gear_up' });
});

// Flaps endpoints
app.post('/api/flaps/set', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const { position } = req.body;
  if (position === undefined || position < 0 || position > 100) {
    return res.status(400).json({ error: 'Invalid flaps position (0-100)' });
  }

  const success = simConnect.setFlaps(position);
  wsManager.notifyAction('flaps_set', success, { position });
  
  res.json({ success, action: 'flaps_set', position });
});

app.post('/api/flaps/increase', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.increaseFlaps();
  wsManager.notifyAction('flaps_increase', success);
  
  res.json({ success, action: 'flaps_increase' });
});

app.post('/api/flaps/decrease', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const success = simConnect.decreaseFlaps();
  wsManager.notifyAction('flaps_decrease', success);
  
  res.json({ success, action: 'flaps_decrease' });
});

// Radio endpoints
app.post('/api/radio/:type', (req, res) => {
  if (!simConnect.isConnected()) {
    return res.status(503).json({ error: 'SimConnect not connected' });
  }

  const { type } = req.params;
  const { frequency } = req.body;
  
  const validTypes = ['com1', 'com2', 'nav1', 'nav2'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid radio type' });
  }

  if (!frequency || frequency < 108 || frequency > 137) {
    return res.status(400).json({ error: 'Invalid frequency (108-137 MHz)' });
  }

  const success = simConnect.setRadioFrequency(type, frequency);
  wsManager.notifyAction(`radio_${type}`, success, { frequency });
  
  res.json({ success, action: `radio_${type}`, frequency });
});

// Voice command endpoint
app.post('/api/voice/command', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  console.log('Voice command received:', command);
  wsManager.notifyVoiceCommand(command, true);
  
  // Process the command (this will be enhanced with command parsing)
  res.json({ 
    success: true, 
    command,
    message: 'Command received and will be processed'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Get network interfaces to display local IP
function getLocalIPAddress() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SHOW_NETWORK_INFO = process.env.SHOW_NETWORK_INFO === 'true';

server.listen(PORT, HOST, () => {
  const localIP = getLocalIPAddress();
  
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     MSFS 2024 Copilot Assistant           ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  
  if (SHOW_NETWORK_INFO && localIP !== 'localhost') {
    console.log(`\n🌐 Network Access:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://${localIP}:${PORT}`);
    console.log(`\n💡 Access from Mac/other devices:`);
    console.log(`   Open http://${localIP}:${PORT} in your browser`);
  } else {
    console.log(`\n📝 Open http://localhost:${PORT} in your browser`);
  }
  
  console.log(`\n⚠️  Make sure MSFS 2024 is running!\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  simConnect.disconnect();
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down gracefully...');
  simConnect.disconnect();
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

// Made with Bob
