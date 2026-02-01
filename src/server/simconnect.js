const { open, Protocol, SimConnectPeriod, SimConnectDataType } = require('node-simconnect');

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
    this.dataDefinitions = {};
  }

  async connect() {
    try {
      console.log('Connecting to MSFS2024 via SimConnect...');
      
      this.handle = await open('MSFS Copilot', Protocol.FSX_SP2);
      this.connected = true;
      
      console.log('✓ Connected to MSFS2024');
      
      // Setup data definitions
      this.setupDataDefinitions();
      
      // Request data updates
      this.requestDataUpdates();
      
      return true;
    } catch (error) {
      console.error('✗ Failed to connect to MSFS2024:', error.message);
      this.connected = false;
      return false;
    }
  }

  setupDataDefinitions() {
    if (!this.handle) return;

    try {
      // Define autopilot data
      this.handle.addToDataDefinition(
        0, // Definition ID
        'AUTOPILOT MASTER',
        'Bool',
        SimConnectDataType.INT32
      );

      this.handle.addToDataDefinition(0, 'AUTOPILOT ALTITUDE LOCK', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(0, 'AUTOPILOT HEADING LOCK', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(0, 'AUTOPILOT NAV1 LOCK', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(0, 'AUTOPILOT APPROACH HOLD', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(0, 'AUTOPILOT ALTITUDE LOCK VAR', 'Feet', SimConnectDataType.FLOAT64);
      this.handle.addToDataDefinition(0, 'AUTOPILOT HEADING LOCK DIR', 'Degrees', SimConnectDataType.FLOAT64);

      // Define lights data
      this.handle.addToDataDefinition(1, 'LIGHT BEACON', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(1, 'LIGHT STROBE', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(1, 'LIGHT NAV', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(1, 'LIGHT LANDING', 'Bool', SimConnectDataType.INT32);
      this.handle.addToDataDefinition(1, 'LIGHT TAXI', 'Bool', SimConnectDataType.INT32);

      // Define gear and flaps
      this.handle.addToDataDefinition(2, 'GEAR POSITION', 'Percent', SimConnectDataType.FLOAT64);
      this.handle.addToDataDefinition(2, 'FLAPS HANDLE PERCENT', 'Percent', SimConnectDataType.FLOAT64);

      // Define aircraft state
      this.handle.addToDataDefinition(3, 'PLANE ALTITUDE', 'Feet', SimConnectDataType.FLOAT64);
      this.handle.addToDataDefinition(3, 'PLANE HEADING DEGREES TRUE', 'Degrees', SimConnectDataType.FLOAT64);
      this.handle.addToDataDefinition(3, 'AIRSPEED INDICATED', 'Knots', SimConnectDataType.FLOAT64);
      this.handle.addToDataDefinition(3, 'VERTICAL SPEED', 'Feet per second', SimConnectDataType.FLOAT64);

      console.log('✓ Data definitions setup complete');
    } catch (error) {
      console.error('✗ Error setting up data definitions:', error.message);
    }
  }

  requestDataUpdates() {
    if (!this.handle) return;

    try {
      // Request periodic updates for all data definitions
      this.handle.requestDataOnSimObject(
        0, 0, 0, SimConnectPeriod.SECOND, 0, 0, 0, 0
      );
      this.handle.requestDataOnSimObject(
        1, 1, 0, SimConnectPeriod.SECOND, 0, 0, 0, 0
      );
      this.handle.requestDataOnSimObject(
        2, 2, 0, SimConnectPeriod.SECOND, 0, 0, 0, 0
      );
      this.handle.requestDataOnSimObject(
        3, 3, 0, SimConnectPeriod.SECOND, 0, 0, 0, 0
      );

      console.log('✓ Data update requests sent');
    } catch (error) {
      console.error('✗ Error requesting data updates:', error.message);
    }
  }

  // Autopilot actions
  toggleAutopilot() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x10000, 0, 5, 0); // AP_MASTER
      return true;
    } catch (error) {
      console.error('Error toggling autopilot:', error.message);
      return false;
    }
  }

  setAltitudeHold(altitude) {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x10001, altitude, 5, 0); // AP_ALT_VAR_SET_ENGLISH
      this.handle.transmitClientEvent(0, 0x10002, 1, 5, 0); // AP_ALT_HOLD
      return true;
    } catch (error) {
      console.error('Error setting altitude hold:', error.message);
      return false;
    }
  }

  setHeadingHold(heading) {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x10003, heading, 5, 0); // HEADING_BUG_SET
      this.handle.transmitClientEvent(0, 0x10004, 1, 5, 0); // AP_HDG_HOLD
      return true;
    } catch (error) {
      console.error('Error setting heading hold:', error.message);
      return false;
    }
  }

  toggleNavMode() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x10005, 0, 5, 0); // AP_NAV1_HOLD
      return true;
    } catch (error) {
      console.error('Error toggling nav mode:', error.message);
      return false;
    }
  }

  toggleApproachMode() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x10006, 0, 5, 0); // AP_APR_HOLD
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
      beacon: 0x20000, // TOGGLE_BEACON_LIGHTS
      strobe: 0x20001, // STROBES_TOGGLE
      nav: 0x20002,    // TOGGLE_NAV_LIGHTS
      landing: 0x20003, // LANDING_LIGHTS_TOGGLE
      taxi: 0x20004    // TOGGLE_TAXI_LIGHTS
    };

    try {
      const eventId = lightEvents[lightType];
      if (eventId) {
        this.handle.transmitClientEvent(0, eventId, 0, 5, 0);
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
      this.handle.transmitClientEvent(0, 0x30000, 0, 5, 0); // GEAR_TOGGLE
      return true;
    } catch (error) {
      console.error('Error toggling gear:', error.message);
      return false;
    }
  }

  setGearDown() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x30001, 0, 5, 0); // GEAR_DOWN
      return true;
    } catch (error) {
      console.error('Error setting gear down:', error.message);
      return false;
    }
  }

  setGearUp() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x30002, 0, 5, 0); // GEAR_UP
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
      this.handle.transmitClientEvent(0, 0x40000, flapsIndex, 5, 0); // FLAPS_SET
      return true;
    } catch (error) {
      console.error('Error setting flaps:', error.message);
      return false;
    }
  }

  increaseFlaps() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x40001, 0, 5, 0); // FLAPS_INCR
      return true;
    } catch (error) {
      console.error('Error increasing flaps:', error.message);
      return false;
    }
  }

  decreaseFlaps() {
    if (!this.handle) return false;
    try {
      this.handle.transmitClientEvent(0, 0x40002, 0, 5, 0); // FLAPS_DECR
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
      com1: 0x50000,
      com2: 0x50001,
      nav1: 0x50002,
      nav2: 0x50003
    };

    try {
      const eventId = radioEvents[radio];
      if (eventId) {
        // Convert frequency to BCD format (e.g., 118.50 -> 11850)
        const bcdFreq = Math.round(frequency * 100);
        this.handle.transmitClientEvent(0, eventId, bcdFreq, 5, 0);
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
