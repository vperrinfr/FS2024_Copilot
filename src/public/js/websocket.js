// WebSocket Client Manager
class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
        this.connected = false;
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        console.log('Connecting to WebSocket:', wsUrl);

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✓ WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
                updateConnectionStatus(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('✗ WebSocket disconnected');
                this.connected = false;
                this.emit('disconnected');
                updateConnectionStatus(false);
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.attemptReconnect();
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'connection':
                console.log('Connection status:', data);
                if (data.simconnect) {
                    updateSimConnectStatus(true);
                } else {
                    updateSimConnectStatus(false);
                }
                break;

            case 'state_update':
                this.emit('state_update', data.data);
                updateCockpitState(data.data);
                break;

            case 'action_result':
                this.emit('action_result', data);
                logActivity(`Action: ${data.action}`, data.success ? 'success' : 'error');
                break;

            case 'voice_command':
                this.emit('voice_command', data);
                logActivity(`Commande vocale: "${data.command}"`, 'voice');
                break;

            case 'simconnect_status':
                updateSimConnectStatus(data.connected);
                if (data.connected) {
                    logActivity('SimConnect connecté', 'success');
                } else {
                    logActivity('SimConnect déconnecté', 'error');
                }
                break;

            case 'pong':
                // Heartbeat response
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            logActivity('Échec de reconnexion WebSocket', 'error');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Reconnecting in ${this.reconnectDelay / 1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }

    requestState() {
        this.send({ type: 'request_state' });
    }

    ping() {
        this.send({ type: 'ping' });
    }

    isConnected() {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Global WebSocket instance
const wsClient = new WebSocketClient();

// Auto-connect on page load
window.addEventListener('DOMContentLoaded', () => {
    wsClient.connect();

    // Send periodic pings to keep connection alive
    setInterval(() => {
        if (wsClient.isConnected()) {
            wsClient.ping();
        }
    }, 30000); // Every 30 seconds
});

// Made with Bob
