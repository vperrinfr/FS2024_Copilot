const { open, Protocol } = require('node-simconnect');

class SimConnectManager {
  constructor() {
    this.handle = null;
    this.connected = false;
    this.cockpitState = {
      autopilot: {
        master: false,
        altitude_hold: false,
        heading_hold: false,
        nav_mode: false,
        approach_mode: false,
        target_altitude: 0,
        target_heading: 0
      },
      lights: {
        beacon: false,
        strobe: false,
        nav: false,
        landing: false,
        taxi: false
      },
      gear: {
        position: 0 // 0 = up, 1 = down
      },
      flaps: {
        position: 0 // 0-100%
      },
      radio: {
        com1: 0,
        com2: 0,
        nav1: 0,
        nav2: 0
      },
      aircraft: {
        altitude: 0,
        heading: 0,
        airspeed: 0,
        vertical_speed: 0
      }
    };
  }

  async connect() {
    try {
      console.log('Connecting to MSFS2024 via SimConnect...');
      
      this.handle = await open('MSFS Copilot', Protocol.FSX_SP2);
      this.connected = true;
      
      console.log('✓ Connected to MSFS2024');
      
      // Setup data subscriptions
      this.setupDataSubscriptions();
      
      return true;
    } catch (error) {
      console.error('✗ Failed to connect to MSFS2024:', error.message);
      this.connected = false;
      return false;
    }
  }

  setupDataSubscriptions() {
    if (!this.handle) return;

    try {
      // Subscribe to aircraft data updates
      this.handle.on('simObjectData', (data) => {
        this.updateCockpitState(data);
      });

      // Request periodic updates for aircraft state
      setInterval(() => {
        if (this.connected && this.handle) {
          this.requestAircraftData();
        }
      }, 1000); // Update every second

      console.log('✓ Data subscriptions setup complete');
    } catch (error) {
      console.error('✗ Error setting up data subscriptions:', error.message);
    }
  }

  requestAircraftData() {
    if (!this.handle) return;

    try {
      // Request various aircraft data
      // Note: node-simconnect API may vary, this is a simplified version
      // You may need to adjust based on the actual API
      this.handle.requestDataOnSimObject([
        'AUTOPILOT MASTER',
        'AUTOPILOT ALTITUDE LOCK',
        'AUTOPILOT HEADING LOCK',
        'AUTOPILOT NAV1 LOCK',
        'AUTOPILOT APPROACH HOLD',
        'LIGHT BEACON',
        'LIGHT STROBE',
        'LIGHT NAV',
        'LIGHT LANDING',
        'LIGHT TAXI',
        'GEAR POSITION',
        'FLAPS HANDLE PERCENT',
        'PLANE ALTITUDE',
        'PLANE HEADING DEGREES TRUE',
        'AIRSPEED INDICATED',
        'VERTICAL SPEED'
      ]);
    } catch (error) {
      // Silently fail if data request fails
      // console.error('Error requesting aircraft data:', error.message);
    }
  }

  updateCockpitState(data) {
    if (!data) return;

    try {
      // Update cockpit state based on received data
      // This is a simplified version - adjust based on actual data structure
      if (data['AUTOPILOT MASTER'] !== undefined) {
        this.cockpitState.autopilot.master = data['AUTOPILOT MASTER'] === 1;
      }
      if (data['AUTOPILOT ALTITUDE LOCK'] !== undefined) {
        this.cockpitState.autopilot.altitude_hold = data['AUTOPILOT ALTITUDE LOCK'] === 1;
      }
      if (data['AUTOPILOT HEADING LOCK'] !== undefined) {
        this.cockpitState.autopilot.heading_hold = data['AUTOPILOT HEADING LOCK'] === 1;
      }
      if (data['AUTOPILOT NAV1 LOCK'] !== undefined) {
        this.cockpitState.autopilot.nav_mode = data['AUTOPILOT NAV1 LOCK'] === 1;
      }
      if (data['AUTOPILOT APPROACH HOLD'] !== undefined) {
        this.cockpitState.autopilot.approach_mode = data['AUTOPILOT APPROACH HOLD'] === 1;
      }

      // Lights
      if (data['LIGHT BEACON'] !== undefined) {
        this.cockpitState.lights.beacon = data['LIGHT BEACON'] === 1;
      }
      if (data['LIGHT STROBE'] !== undefined) {
        this.cockpitState.lights.strobe = data['LIGHT STROBE'] === 1;
      }
      if (data['LIGHT NAV'] !== undefined) {
        this.cockpitState.lights.nav = data['LIGHT NAV'] === 1;
      }
      if (data['LIGHT LANDING'] !== undefined) {
        this.cockpitState.lights.landing = data['LIGHT LANDING'] === 1;
      }
      if (data['LIGHT TAXI'] !== undefined) {
        this.cockpitState.lights.taxi = data['LIGHT TAXI'] === 1;
      }

      // Gear and Flaps
      if (data['GEAR POSITION'] !== undefined) {
        this.cockpitState.gear.position = data['GEAR POSITION'];
      }
      if (data['FLAPS HANDLE PERCENT'] !== undefined) {
        this.cockpitState.flaps.position = data['FLAPS HANDLE PERCENT'];
      }

      // Aircraft state
      if (data['PLANE ALTITUDE'] !== undefined) {
        this.cockpitState.aircraft.altitude = data['PLANE ALTITUDE'];
      }
      if (data['PLANE HEADING DEGREES TRUE'] !== undefined) {
        this.cockpitState.aircraft.heading = data['PLANE HEADING DEGREES TRUE'];
      }
      if (data['AIRSPEED INDICATED'] !== undefined) {
        this.cockpitState.aircraft.airspeed = data['AIRSPEED INDICATED'];
      }
      if (data['VERTICAL SPEED'] !== undefined) {
        this.cockpitState.aircraft.vertical_speed = data['VERTICAL SPEED'];
      }
    } catch (error) {
      console.error('Error updating cockpit state:', error.message);
    }
  }

  // Autopilot actions
  toggleAutopilot() {
    if (!this.handle) return false;
    try {
      // Use the correct method for node-simconnect
      this.handle.sendEventToSimulator('AP_MASTER', 0);
      return true;
    } catch (error) {
      console.error('Error toggling autopilot:', error.message);
      return false;
    }
  }

  setAltitudeHold(altitude) {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('AP_ALT_VAR_SET_ENGLISH', altitude);
      this.handle.sendEventToSimulator('AP_ALT_HOLD_ON', 0);
      return true;
    } catch (error) {
      console.error('Error setting altitude hold:', error.message);
      return false;
    }
  }

  setHeadingHold(heading) {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('HEADING_BUG_SET', heading);
      this.handle.sendEventToSimulator('AP_HDG_HOLD_ON', 0);
      return true;
    } catch (error) {
      console.error('Error setting heading hold:', error.message);
      return false;
    }
  }

  toggleNavMode() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('AP_NAV1_HOLD', 0);
      return true;
    } catch (error) {
      console.error('Error toggling nav mode:', error.message);
      return false;
    }
  }

  toggleApproachMode() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('AP_APR_HOLD', 0);
      return true;
    } catch (error) {
      console.error('Error toggling approach mode:', error.message);
      return false;
    }
  }

  // Lights actions
  toggleLight(lightType) {
    if (!this.handle) return false;
    const lightEvents = {
      beacon: 'TOGGLE_BEACON_LIGHTS',
      strobe: 'STROBES_TOGGLE',
      nav: 'TOGGLE_NAV_LIGHTS',
      landing: 'LANDING_LIGHTS_TOGGLE',
      taxi: 'TOGGLE_TAXI_LIGHTS'
    };

    try {
      const eventName = lightEvents[lightType];
      if (eventName) {
        this.handle.sendEventToSimulator(eventName, 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error toggling ${lightType} light:`, error.message);
      return false;
    }
  }

  // Gear actions
  toggleGear() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('GEAR_TOGGLE', 0);
      return true;
    } catch (error) {
      console.error('Error toggling gear:', error.message);
      return false;
    }
  }

  setGearDown() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('GEAR_DOWN', 0);
      return true;
    } catch (error) {
      console.error('Error setting gear down:', error.message);
      return false;
    }
  }

  setGearUp() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('GEAR_UP', 0);
      return true;
    } catch (error) {
      console.error('Error setting gear up:', error.message);
      return false;
    }
  }

  // Flaps actions
  setFlaps(position) {
    if (!this.handle) return false;
    try {
      // Convert percentage to flaps index (0-4 typically)
      const flapsIndex = Math.round((position / 100) * 4);
      this.handle.sendEventToSimulator('FLAPS_SET', flapsIndex);
      return true;
    } catch (error) {
      console.error('Error setting flaps:', error.message);
      return false;
    }
  }

  increaseFlaps() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('FLAPS_INCR', 0);
      return true;
    } catch (error) {
      console.error('Error increasing flaps:', error.message);
      return false;
    }
  }

  decreaseFlaps() {
    if (!this.handle) return false;
    try {
      this.handle.sendEventToSimulator('FLAPS_DECR', 0);
      return true;
    } catch (error) {
      console.error('Error decreasing flaps:', error.message);
      return false;
    }
  }

  // Radio actions
  setRadioFrequency(radio, frequency) {
    if (!this.handle) return false;
    const radioEvents = {
      com1: 'COM_RADIO_SET',
      com2: 'COM2_RADIO_SET',
      nav1: 'NAV1_RADIO_SET',
      nav2: 'NAV2_RADIO_SET'
    };

    try {
      const eventName = radioEvents[radio];
      if (eventName) {
        // Convert frequency to BCD format (e.g., 118.50 -> 11850)
        const bcdFreq = Math.round(frequency * 100);
        this.handle.sendEventToSimulator(eventName, bcdFreq);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error setting ${radio} frequency:`, error.message);
      return false;
    }
  }

  getCockpitState() {
    return this.cockpitState;
  }

  isConnected() {
    return this.connected;
  }

  disconnect() {
    if (this.handle) {
      try {
        this.handle.close();
        this.connected = false;
        console.log('✓ Disconnected from MSFS2024');
      } catch (error) {
        console.error('Error disconnecting:', error.message);
      }
    }
  }
}

module.exports = SimConnectManager;

// Made with Bob
