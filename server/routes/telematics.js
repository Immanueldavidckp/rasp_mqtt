const express = require('express');
const Joi = require('joi');

const router = express.Router();

// Generate mock historical data
const generateHistoricalData = (parameter, days = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    
    let value;
    switch (parameter) {
      case 'engineRpm':
        value = 1800 + Math.random() * 400; // 1800-2200 RPM
        break;
      case 'engineTemperature':
        value = 80 + Math.random() * 20; // 80-100°C
        break;
      case 'hydraulicPressure':
        value = 2700 + Math.random() * 400; // 2700-3100 psi
        break;
      case 'oilPressure':
        value = 40 + Math.random() * 15; // 40-55 psi
        break;
      case 'batteryMonitor':
        value = 70 + Math.random() * 30; // 70-100%
        break;
      case 'tilt':
        value = Math.random() * 10; // 0-10 degrees
        break;
      case 'angle':
        value = Math.random() * 45; // 0-45 degrees
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100,
      quality: Math.random() > 0.1 ? 'good' : 'poor'
    });
  }
  
  return data;
};

// Validation schemas
const historicalDataSchema = Joi.object({
  parameter: Joi.string().required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  interval: Joi.string().valid('hour', 'day', 'week').default('day'),
  limit: Joi.number().integer().min(1).max(1000).default(100)
});

const realtimeDataSchema = Joi.object({
  parameters: Joi.array().items(Joi.string()).optional(),
  interval: Joi.number().integer().min(1000).max(60000).default(5000) // milliseconds
});

// Get real-time telematics data
router.get('/realtime', (req, res) => {
  try {
    const realtimeData = {
      timestamp: new Date().toISOString(),
      vehicleId: 'MEWP-001',
      data: {
        engineRpm: 1850 + Math.random() * 100,
        engineTemperature: 85 + Math.random() * 10,
        hydraulicPressure: 2800 + Math.random() * 200,
        oilPressure: 45 + Math.random() * 5,
        batteryMonitor: 85 + Math.random() * 10,
        tilt: Math.random() * 5,
        angle: 15 + Math.random() * 10,
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.01,
          lng: -74.0060 + (Math.random() - 0.5) * 0.01,
          speed: Math.random() * 20,
          heading: Math.random() * 360
        },
        operationalStatus: {
          engineRunning: Math.random() > 0.2,
          hydraulicsActive: Math.random() > 0.3,
          platformExtended: Math.random() > 0.5,
          emergencyStop: Math.random() < 0.05
        }
      },
      quality: 'good',
      signalStrength: 85 + Math.random() * 15
    };

    res.json({
      success: true,
      data: realtimeData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    res.status(500).json({
      error: 'Failed to fetch real-time data',
      code: 'REALTIME_DATA_ERROR'
    });
  }
});

// Get historical telematics data
router.get('/historical', (req, res) => {
  try {
    const { error, value } = historicalDataSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { parameter, startDate, endDate, interval, limit } = value;
    
    // Calculate days based on date range or use default
    let days = 7;
    if (startDate && endDate) {
      days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    }

    const historicalData = generateHistoricalData(parameter, Math.min(days, 30));
    
    // Apply limit
    const limitedData = historicalData.slice(-limit);

    res.json({
      success: true,
      data: {
        parameter,
        interval,
        dataPoints: limitedData,
        summary: {
          count: limitedData.length,
          average: limitedData.reduce((sum, point) => sum + point.value, 0) / limitedData.length,
          min: Math.min(...limitedData.map(point => point.value)),
          max: Math.max(...limitedData.map(point => point.value)),
          latest: limitedData[limitedData.length - 1]
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      code: 'HISTORICAL_DATA_ERROR'
    });
  }
});

// Get data trends and analytics
router.get('/trends', (req, res) => {
  try {
    const { parameter = 'engineRpm', period = '24h' } = req.query;
    
    const trends = {
      parameter,
      period,
      trend: 'stable', // stable, increasing, decreasing
      changeRate: Math.random() * 10 - 5, // -5% to +5%
      predictions: {
        nextHour: 1850 + Math.random() * 100,
        next24Hours: 1850 + Math.random() * 200,
        confidence: 85 + Math.random() * 10
      },
      anomalies: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          value: 2500,
          severity: 'medium',
          description: 'RPM spike detected'
        }
      ],
      patterns: {
        dailyPeak: '14:30',
        dailyLow: '06:00',
        weeklyPattern: 'consistent',
        seasonalTrend: 'stable'
      }
    };

    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      error: 'Failed to fetch trends',
      code: 'TRENDS_ERROR'
    });
  }
});

// Get alerts and notifications
router.get('/alerts', (req, res) => {
  try {
    const { severity, limit = 50, active = true } = req.query;
    
    const alerts = [
      {
        id: 'alert_001',
        timestamp: new Date().toISOString(),
        parameter: 'engineTemperature',
        severity: 'high',
        message: 'Engine temperature approaching critical threshold',
        value: 95,
        threshold: 100,
        active: true,
        acknowledged: false
      },
      {
        id: 'alert_002',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        parameter: 'batteryMonitor',
        severity: 'medium',
        message: 'Battery level below recommended threshold',
        value: 25,
        threshold: 30,
        active: true,
        acknowledged: false
      },
      {
        id: 'alert_003',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        parameter: 'hydraulicPressure',
        severity: 'low',
        message: 'Hydraulic pressure fluctuation detected',
        value: 2750,
        threshold: 2800,
        active: false,
        acknowledged: true
      }
    ];

    let filteredAlerts = alerts;
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (active !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.active === (active === 'true'));
    }
    
    filteredAlerts = filteredAlerts.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        alerts: filteredAlerts,
        summary: {
          total: filteredAlerts.length,
          active: filteredAlerts.filter(a => a.active).length,
          critical: filteredAlerts.filter(a => a.severity === 'high').length,
          unacknowledged: filteredAlerts.filter(a => !a.acknowledged).length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      code: 'ALERTS_ERROR'
    });
  }
});

// Acknowledge alert
router.put('/alerts/:alertId/acknowledge', (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;

    // In a real implementation, you would update the alert in the database
    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: {
        alertId,
        acknowledgedBy: userId || req.user.id,
        acknowledgedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      error: 'Failed to acknowledge alert',
      code: 'ACKNOWLEDGE_ALERT_ERROR'
    });
  }
});

// Get data quality metrics
router.get('/quality', (req, res) => {
  try {
    const qualityMetrics = {
      overall: 92.5,
      parameters: {
        engineRpm: { quality: 95.2, lastUpdate: new Date().toISOString(), status: 'good' },
        engineTemperature: { quality: 88.7, lastUpdate: new Date().toISOString(), status: 'good' },
        hydraulicPressure: { quality: 91.3, lastUpdate: new Date().toISOString(), status: 'good' },
        oilPressure: { quality: 89.1, lastUpdate: new Date().toISOString(), status: 'good' },
        batteryMonitor: { quality: 96.8, lastUpdate: new Date().toISOString(), status: 'excellent' },
        location: { quality: 87.4, lastUpdate: new Date().toISOString(), status: 'good' }
      },
      connectivity: {
        signalStrength: 85,
        dataLoss: 2.3,
        latency: 150,
        uptime: 99.2
      },
      issues: [
        {
          parameter: 'location',
          issue: 'Intermittent GPS signal loss',
          impact: 'low',
          duration: '15 minutes'
        }
      ]
    };

    res.json({
      success: true,
      data: qualityMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching quality metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch quality metrics',
      code: 'QUALITY_METRICS_ERROR'
    });
  }
});

module.exports = router;