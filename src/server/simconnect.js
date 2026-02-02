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
      },
      fuel: {
        total_quantity: 0,
        total_capacity: 0,
        total_weight: 0,
        flow_rate: 0,
        remaining_time: 0
      },
      engines: {
        count: 0,
        engine1: {
          running: false,
          rpm: 0,
          n1: 0,
          n2: 0,
          egt: 0,
          oil_temp: 0,
          oil_pressure: 0,
          fuel_flow: 0
        },
        engine2: {
          running: false,
          rpm: 0,
          n1: 0,
          n2: 0,
          egt: 0,
          oil_temp: 0,
          oil_pressure: 0,
          fuel_flow: 0
        },
        engine3: {
          running: false,
          rpm: 0,
          n1: 0,
          n2: 0,
          egt: 0,
          oil_temp: 0,
          oil_pressure: 0,
          fuel_flow: 0
        },
        engine4: {
          running: false,
          rpm: 0,
          n1: 0,
          n2: 0,
          egt: 0,
          oil_temp: 0,
          oil_pressure: 0,
          fuel_flow: 0
        }
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
      // Request various aircraft data using the correct API
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
        'VERTICAL SPEED',
        // Fuel data
        'FUEL TOTAL QUANTITY',
        'FUEL TOTAL CAPACITY',
        'FUEL TOTAL WEIGHT',
        'FUEL FLOW GPH',
        // Engine count
        'NUMBER OF ENGINES',
        // Engine 1
        'GENERAL ENG COMBUSTION:1',
        'GENERAL ENG RPM:1',
        'TURB ENG N1:1',
        'TURB ENG N2:1',
        'ENG EXHAUST GAS TEMPERATURE:1',
        'ENG OIL TEMPERATURE:1',
        'ENG OIL PRESSURE:1',
        'ENG FUEL FLOW GPH:1',
        // Engine 2
        'GENERAL ENG COMBUSTION:2',
        'GENERAL ENG RPM:2',
        'TURB ENG N1:2',
        'TURB ENG N2:2',
        'ENG EXHAUST GAS TEMPERATURE:2',
        'ENG OIL TEMPERATURE:2',
        'ENG OIL PRESSURE:2',
        'ENG FUEL FLOW GPH:2',
        // Engine 3
        'GENERAL ENG COMBUSTION:3',
        'GENERAL ENG RPM:3',
        'TURB ENG N1:3',
        'TURB ENG N2:3',
        'ENG EXHAUST GAS TEMPERATURE:3',
        'ENG OIL TEMPERATURE:3',
        'ENG OIL PRESSURE:3',
        'ENG FUEL FLOW GPH:3',
        // Engine 4
        'GENERAL ENG COMBUSTION:4',
        'GENERAL ENG RPM:4',
        'TURB ENG N1:4',
        'TURB ENG N2:4',
        'ENG EXHAUST GAS TEMPERATURE:4',
        'ENG OIL TEMPERATURE:4',
        'ENG OIL PRESSURE:4',
        'ENG FUEL FLOW GPH:4'
      ]);
    } catch (error) {
      // Silently fail if data request fails
    }
  }

  updateCockpitState(data) {
    if (!data) return;

    try {
      // Update cockpit state based on received data
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

      // Fuel data
      if (data['FUEL TOTAL QUANTITY'] !== undefined) {
        this.cockpitState.fuel.total_quantity = data['FUEL TOTAL QUANTITY'];
      }
      if (data['FUEL TOTAL CAPACITY'] !== undefined) {
        this.cockpitState.fuel.total_capacity = data['FUEL TOTAL CAPACITY'];
      }
      if (data['FUEL TOTAL WEIGHT'] !== undefined) {
        this.cockpitState.fuel.total_weight = data['FUEL TOTAL WEIGHT'];
      }
      if (data['FUEL FLOW GPH'] !== undefined) {
        this.cockpitState.fuel.flow_rate = data['FUEL FLOW GPH'];
      }
      // Calculate remaining time
      if (this.cockpitState.fuel.flow_rate > 0) {
        this.cockpitState.fuel.remaining_time =
          (this.cockpitState.fuel.total_quantity / this.cockpitState.fuel.flow_rate) * 60;
      } else {
        this.cockpitState.fuel.remaining_time = 0;
      }

      // Engine count
      if (data['NUMBER OF ENGINES'] !== undefined) {
        this.cockpitState.engines.count = data['NUMBER OF ENGINES'];
      }

      // Engine 1
      if (data['GENERAL ENG COMBUSTION:1'] !== undefined) {
        this.cockpitState.engines.engine1.running = data['GENERAL ENG COMBUSTION:1'] === 1;
      }
      if (data['GENERAL ENG RPM:1'] !== undefined) {
        this.cockpitState.engines.engine1.rpm = data['GENERAL ENG RPM:1'];
      }
      if (data['TURB ENG N1:1'] !== undefined) {
        this.cockpitState.engines.engine1.n1 = data['TURB ENG N1:1'];
      }
      if (data['TURB ENG N2:1'] !== undefined) {
        this.cockpitState.engines.engine1.n2 = data['TURB ENG N2:1'];
      }
      if (data['ENG EXHAUST GAS TEMPERATURE:1'] !== undefined) {
        this.cockpitState.engines.engine1.egt = data['ENG EXHAUST GAS TEMPERATURE:1'];
      }
      if (data['ENG OIL TEMPERATURE:1'] !== undefined) {
        this.cockpitState.engines.engine1.oil_temp = data['ENG OIL TEMPERATURE:1'];
      }
      if (data['ENG OIL PRESSURE:1'] !== undefined) {
        this.cockpitState.engines.engine1.oil_pressure = data['ENG OIL PRESSURE:1'];
      }
      if (data['ENG FUEL FLOW GPH:1'] !== undefined) {
        this.cockpitState.engines.engine1.fuel_flow = data['ENG FUEL FLOW GPH:1'];
      }

      // Engine 2
      if (data['GENERAL ENG COMBUSTION:2'] !== undefined) {
        this.cockpitState.engines.engine2.running = data['GENERAL ENG COMBUSTION:2'] === 1;
      }
      if (data['GENERAL ENG RPM:2'] !== undefined) {
        this.cockpitState.engines.engine2.rpm = data['GENERAL ENG RPM:2'];
      }
      if (data['TURB ENG N1:2'] !== undefined) {
        this.cockpitState.engines.engine2.n1 = data['TURB ENG N1:2'];
      }
      if (data['TURB ENG N2:2'] !== undefined) {
        this.cockpitState.engines.engine2.n2 = data['TURB ENG N2:2'];
      }
      if (data['ENG EXHAUST GAS TEMPERATURE:2'] !== undefined) {
        this.cockpitState.engines.engine2.egt = data['ENG EXHAUST GAS TEMPERATURE:2'];
      }
      if (data['ENG OIL TEMPERATURE:2'] !== undefined) {
        this.cockpitState.engines.engine2.oil_temp = data['ENG OIL TEMPERATURE:2'];
      }
      if (data['ENG OIL PRESSURE:2'] !== undefined) {
        this.cockpitState.engines.engine2.oil_pressure = data['ENG OIL PRESSURE:2'];
      }
      if (data['ENG FUEL FLOW GPH:2'] !== undefined) {
        this.cockpitState.engines.engine2.fuel_flow = data['ENG FUEL FLOW GPH:2'];
      }

      // Engine 3
      if (data['GENERAL ENG COMBUSTION:3'] !== undefined) {
        this.cockpitState.engines.engine3.running = data['GENERAL ENG COMBUSTION:3'] === 1;
      }
      if (data['GENERAL ENG RPM:3'] !== undefined) {
        this.cockpitState.engines.engine3.rpm = data['GENERAL ENG RPM:3'];
      }
      if (data['TURB ENG N1:3'] !== undefined) {
        this.cockpitState.engines.engine3.n1 = data['TURB ENG N1:3'];
      }
      if (data['TURB ENG N2:3'] !== undefined) {
        this.cockpitState.engines.engine3.n2 = data['TURB ENG N2:3'];
      }
      if (data['ENG EXHAUST GAS TEMPERATURE:3'] !== undefined) {
        this.cockpitState.engines.engine3.egt = data['ENG EXHAUST GAS TEMPERATURE:3'];
      }
      if (data['ENG OIL TEMPERATURE:3'] !== undefined) {
        this.cockpitState.engines.engine3.oil_temp = data['ENG OIL TEMPERATURE:3'];
      }
      if (data['ENG OIL PRESSURE:3'] !== undefined) {
        this.cockpitState.engines.engine3.oil_pressure = data['ENG OIL PRESSURE:3'];
      }
      if (data['ENG FUEL FLOW GPH:3'] !== undefined) {
        this.cockpitState.engines.engine3.fuel_flow = data['ENG FUEL FLOW GPH:3'];
      }

      // Engine 4
      if (data['GENERAL ENG COMBUSTION:4'] !== undefined) {
        this.cockpitState.engines.engine4.running = data['GENERAL ENG COMBUSTION:4'] === 1;
      }
      if (data['GENERAL ENG RPM:4'] !== undefined) {
        this.cockpitState.engines.engine4.rpm = data['GENERAL ENG RPM:4'];
      }
      if (data['TURB ENG N1:4'] !== undefined) {
        this.cockpitState.engines.engine4.n1 = data['TURB ENG N1:4'];
      }
      if (data['TURB ENG N2:4'] !== undefined) {
        this.cockpitState.engines.engine4.n2 = data['TURB ENG N2:4'];
      }
      if (data['ENG EXHAUST GAS TEMPERATURE:4'] !== undefined) {
        this.cockpitState.engines.engine4.egt = data['ENG EXHAUST GAS TEMPERATURE:4'];
      }
      if (data['ENG OIL TEMPERATURE:4'] !== undefined) {
        this.cockpitState.engines.engine4.oil_temp = data['ENG OIL TEMPERATURE:4'];
      }
      if (data['ENG OIL PRESSURE:4'] !== undefined) {
        this.cockpitState.engines.engine4.oil_pressure = data['ENG OIL PRESSURE:4'];
      }
      if (data['ENG FUEL FLOW GPH:4'] !== undefined) {
        this.cockpitState.engines.engine4.fuel_flow = data['ENG FUEL FLOW GPH:4'];
      }
    } catch (error) {
      console.error('Error updating cockpit state:', error.message);
    }
  }

  // Autopilot actions - Using correct API for node-simconnect 4.0.0
  toggleAutopilot() {
    if (!this.handle) return false;
    try {
      // node-simconnect 4.0.0 uses different method
      this.handle.set('K:AP_MASTER', 0);
      return true;
    } catch (error) {
      console.error('Error toggling autopilot:', error.message);
      return false;
    }
  }

  setAltitudeHold(altitude) {
    if (!this.handle) return false;
    try {
      this.handle.set('K:AP_ALT_VAR_SET_ENGLISH', altitude);
      this.handle.set('K:AP_ALT_HOLD_ON', 0);
      return true;
    } catch (error) {
      console.error('Error setting altitude hold:', error.message);
      return false;
    }
  }

  setHeadingHold(heading) {
    if (!this.handle) return false;
    try {
      this.handle.set('K:HEADING_BUG_SET', heading);
      this.handle.set('K:AP_HDG_HOLD_ON', 0);
      return true;
    } catch (error) {
      console.error('Error setting heading hold:', error.message);
      return false;
    }
  }

  toggleNavMode() {
    if (!this.handle) return false;
    try {
      this.handle.set('K:AP_NAV1_HOLD', 0);
      return true;
    } catch (error) {
      console.error('Error toggling nav mode:', error.message);
      return false;
    }
  }

  toggleApproachMode() {
    if (!this.handle) return false;
    try {
      this.handle.set('K:AP_APR_HOLD', 0);
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
      beacon: 'K:TOGGLE_BEACON_LIGHTS',
      strobe: 'K:STROBES_TOGGLE',
      nav: 'K:TOGGLE_NAV_LIGHTS',
      landing: 'K:LANDING_LIGHTS_TOGGLE',
      taxi: 'K:TOGGLE_TAXI_LIGHTS'
    };

    try {
      const eventName = lightEvents[lightType];
      if (eventName) {
        this.handle.set(eventName, 0);
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
      this.handle.set('K:GEAR_TOGGLE', 0);
      return true;
    } catch (error) {
      console.error('Error toggling gear:', error.message);
      return false;
    }
  }

  setGearDown() {
    if (!this.handle) return false;
    try {
      this.handle.set('K:GEAR_DOWN', 0);
      return true;
    } catch (error) {
      console.error('Error setting gear down:', error.message);
      return false;
    }
  }

  setGearUp() {
    if (!this.handle) return false;
    try {
      this.handle.set('K:GEAR_UP', 0);
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
      this.handle.set('K:FLAPS_SET', flapsIndex);
      return true;
    } catch (error) {
      console.error('Error setting flaps:', error.message);
      return false;
    }
  }

  increaseFlaps() {
    if (!this.handle) return false;
    try {
      this.handle.set('K:FLAPS_INCR', 0);
      return true;
    } catch (error) {
      console.error('Error increasing flaps:', error.message);
      return false;
    }
  }

  decreaseFlaps() {
    if (!this.handle) return false;
    try {
      this.handle.set('K:FLAPS_DECR', 0);
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
      com1: 'K:COM_RADIO_SET',
      com2: 'K:COM2_RADIO_SET',
      nav1: 'K:NAV1_RADIO_SET',
      nav2: 'K:NAV2_RADIO_SET'
    };

    try {
      const eventName = radioEvents[radio];
      if (eventName) {
        // Convert frequency to BCD format (e.g., 118.50 -> 11850)
        const bcdFreq = Math.round(frequency * 100);
        this.handle.set(eventName, bcdFreq);
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
