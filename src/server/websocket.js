const WebSocket = require('ws');

class WebSocketManager {
  constructor(server, simConnectManager) {
    this.wss = new WebSocket.Server({ server });
    this.simConnect = simConnectManager;
    this.clients = new Set();
    
    this.setupWebSocketServer();
    this.startStateUpdates();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      console.log('✓ New WebSocket client connected');
      this.clients.add(ws);

      // Send initial state
      this.sendToClient(ws, {
        type: 'connection',
        status: 'connected',
        simconnect: this.simConnect.isConnected()
      });

      // Send current cockpit state
      if (this.simConnect.isConnected()) {
        this.sendToClient(ws, {
          type: 'state_update',
          data: this.simConnect.getCockpitState()
        });
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error.message);
        }
      });

      ws.on('close', () => {
        console.log('✗ WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        this.clients.delete(ws);
      });
    });

    console.log('✓ WebSocket server initialized');
  }

  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong' });
        break;
      
      case 'request_state':
        this.sendToClient(ws, {
          type: 'state_update',
          data: this.simConnect.getCockpitState()
        });
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  startStateUpdates() {
    // Send state updates every second to all connected clients
    setInterval(() => {
      if (this.simConnect.isConnected() && this.clients.size > 0) {
        const state = this.simConnect.getCockpitState();
        this.broadcast({
          type: 'state_update',
          data: state
        });
      }
    }, 1000);
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  sendToClient(client, message) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  notifyAction(action, success, details = {}) {
    this.broadcast({
      type: 'action_result',
      action,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  notifyVoiceCommand(command, recognized) {
    this.broadcast({
      type: 'voice_command',
      command,
      recognized,
      timestamp: new Date().toISOString()
    });
  }

  notifySimConnectStatus(connected) {
    this.broadcast({
      type: 'simconnect_status',
      connected,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = WebSocketManager;

// Made with Bob
