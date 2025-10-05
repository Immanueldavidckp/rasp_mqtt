const express = require('express');
const Joi = require('joi');

const router = express.Router();

// Vehicle parameters based on the requirements table
const vehicleParameters = {
  autoBilling: {
    switchOnOff: { value: false, unit: 'boolean', source: 'Telematic', lastUpdated: new Date() },
    machineDetails: { value: 'MEWP-001', unit: 'string', source: 'ERP', lastUpdated: new Date() },
    customerDetails: { value: 'Customer ABC', unit: 'string', source: 'ERP', lastUpdated: new Date() },
    rentalDetails: { value: 'Rental Contract #123', unit: 'string', source: 'ERP', lastUpdated: new Date() },
    numberOfShifts: { value: 2, unit: 'count', source: 'ERP', lastUpdated: new Date() }
  },
  assetMaintenance: {
    pmHmr: { value: 245.5, unit: 'hours', source: 'Telematic', lastUpdated: new Date() },
    cmHmr: { value: 180.2, unit: 'hours', source: 'Telematic', lastUpdated: new Date() }
  },
  properUsage: {
    overload: { value: false, unit: 'boolean', source: 'Telematic', threshold: 100, lastUpdated: new Date() },
    tilt: { value: 2.5, unit: 'degrees', source: 'Telematic', threshold: 5, lastUpdated: new Date() },
    angle: { value: 15.3, unit: 'degrees', source: 'Telematic', threshold: 30, lastUpdated: new Date() },
    lowFuel: { value: false, unit: 'boolean', source: 'Telematic', threshold: 10, lastUpdated: new Date() },
    engineRpm: { value: 1850, unit: 'rpm', source: 'Telematic', threshold: 2500, lastUpdated: new Date() },
    longMarching: { value: false, unit: 'boolean', source: 'Telematic', lastUpdated: new Date() },
    oilPressure: { value: 45.2, unit: 'psi', source: 'Telematic', threshold: 30, lastUpdated: new Date() },
    engineTemperature: { value: 85.5, unit: '°C', source: 'Telematic', threshold: 100, lastUpdated: new Date() },
    hydraulicPressure: { value: 2800, unit: 'psi', source: 'Telematic', threshold: 3000, lastUpdated: new Date() }
  },
  geofencing: {
    location: { 
      value: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }, 
      unit: 'coordinates', 
      source: 'Telematic', 
      lastUpdated: new Date() 
    },
    machineMovement: { value: 'stationary', unit: 'status', source: 'Telematic', lastUpdated: new Date() }
  },
  applicationMonitoring: {
    longTraction: { value: false, unit: 'boolean', source: 'Telematic', lastUpdated: new Date() },
    onOffTime: { 
      value: { onTime: '08:00', offTime: '17:30', totalHours: 9.5 }, 
      unit: 'time', 
      source: 'Telematic', 
      lastUpdated: new Date() 
    },
    autoShutoff: { value: true, unit: 'boolean', source: 'Telematic', lastUpdated: new Date() }
  },
  functionalParameter: {
    batteryMonitor: { value: 85, unit: '%', source: 'Telematic', threshold: 20, lastUpdated: new Date() }
  }
};

// Validation schemas
const parameterUpdateSchema = Joi.object({
  category: Joi.string().valid('autoBilling', 'assetMaintenance', 'properUsage', 'geofencing', 'applicationMonitoring', 'functionalParameter').required(),
  parameter: Joi.string().required(),
  value: Joi.alternatives().try(Joi.number(), Joi.string(), Joi.boolean(), Joi.object()).required()
});

// Get all vehicle parameters
router.get('/parameters', (req, res) => {
  try {
    res.json({
      success: true,
      data: vehicleParameters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicle parameters:', error);
    res.status(500).json({
      error: 'Failed to fetch vehicle parameters',
      code: 'FETCH_PARAMETERS_ERROR'
    });
  }
});

// Get parameters by category
router.get('/parameters/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!vehicleParameters[category]) {
      return res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
        availableCategories: Object.keys(vehicleParameters)
      });
    }

    res.json({
      success: true,
      category,
      data: vehicleParameters[category],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching category parameters:', error);
    res.status(500).json({
      error: 'Failed to fetch category parameters',
      code: 'FETCH_CATEGORY_ERROR'
    });
  }
});

// Get specific parameter
router.get('/parameters/:category/:parameter', (req, res) => {
  try {
    const { category, parameter } = req.params;
    
    if (!vehicleParameters[category]) {
      return res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND'
      });
    }

    if (!vehicleParameters[category][parameter]) {
      return res.status(404).json({
        error: 'Parameter not found',
        code: 'PARAMETER_NOT_FOUND',
        availableParameters: Object.keys(vehicleParameters[category])
      });
    }

    res.json({
      success: true,
      category,
      parameter,
      data: vehicleParameters[category][parameter],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching specific parameter:', error);
    res.status(500).json({
      error: 'Failed to fetch parameter',
      code: 'FETCH_PARAMETER_ERROR'
    });
  }
});

// Update parameter value (for testing/simulation)
router.put('/parameters/:category/:parameter', (req, res) => {
  try {
    const { category, parameter } = req.params;
    const { error, value } = parameterUpdateSchema.validate({
      category,
      parameter,
      value: req.body.value
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    if (!vehicleParameters[category]) {
      return res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND'
      });
    }

    if (!vehicleParameters[category][parameter]) {
      return res.status(404).json({
        error: 'Parameter not found',
        code: 'PARAMETER_NOT_FOUND'
      });
    }

    // Update parameter value
    vehicleParameters[category][parameter].value = value.value;
    vehicleParameters[category][parameter].lastUpdated = new Date();

    res.json({
      success: true,
      message: 'Parameter updated successfully',
      category,
      parameter,
      data: vehicleParameters[category][parameter],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating parameter:', error);
    res.status(500).json({
      error: 'Failed to update parameter',
      code: 'UPDATE_PARAMETER_ERROR'
    });
  }
});

// Get vehicle status summary
router.get('/status', (req, res) => {
  try {
    const status = {
      overall: 'operational',
      alerts: [],
      criticalParameters: [],
      lastUpdate: new Date().toISOString()
    };

    // Check for critical conditions
    const { properUsage, functionalParameter } = vehicleParameters;

    // Check overload
    if (properUsage.overload.value) {
      status.alerts.push({
        type: 'critical',
        parameter: 'overload',
        message: 'Vehicle is overloaded',
        timestamp: properUsage.overload.lastUpdated
      });
      status.overall = 'warning';
    }

    // Check low fuel
    if (properUsage.lowFuel.value) {
      status.alerts.push({
        type: 'warning',
        parameter: 'lowFuel',
        message: 'Low fuel level detected',
        timestamp: properUsage.lowFuel.lastUpdated
      });
    }

    // Check battery level
    if (functionalParameter.batteryMonitor.value < functionalParameter.batteryMonitor.threshold) {
      status.alerts.push({
        type: 'warning',
        parameter: 'batteryMonitor',
        message: `Battery level low: ${functionalParameter.batteryMonitor.value}%`,
        timestamp: functionalParameter.batteryMonitor.lastUpdated
      });
    }

    // Check engine temperature
    if (properUsage.engineTemperature.value > properUsage.engineTemperature.threshold) {
      status.alerts.push({
        type: 'critical',
        parameter: 'engineTemperature',
        message: `Engine temperature high: ${properUsage.engineTemperature.value}°C`,
        timestamp: properUsage.engineTemperature.lastUpdated
      });
      status.overall = 'critical';
    }

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicle status:', error);
    res.status(500).json({
      error: 'Failed to fetch vehicle status',
      code: 'FETCH_STATUS_ERROR'
    });
  }
});

// Get vehicle information
router.get('/info', (req, res) => {
  try {
    const vehicleInfo = {
      id: 'MEWP-001',
      model: 'Dingli MEWP',
      type: 'Mobile Elevated Work Platform',
      serialNumber: 'DL2024001',
      manufacturingDate: '2024-01-15',
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2024-11-15',
      operatingHours: vehicleParameters.assetMaintenance.pmHmr.value,
      location: vehicleParameters.geofencing.location.value,
      status: 'operational'
    };

    res.json({
      success: true,
      data: vehicleInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicle info:', error);
    res.status(500).json({
      error: 'Failed to fetch vehicle information',
      code: 'FETCH_INFO_ERROR'
    });
  }
});

module.exports = router;