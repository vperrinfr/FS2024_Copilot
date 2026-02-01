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
      
      return true;
    } catch (error) {
      console.error('✗ Failed to connect to MSFS2024:', error.message);
      this.connected = false;
      return false;
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
