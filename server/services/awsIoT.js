const AWS = require('aws-sdk');
const AWSIoTData = require('aws-iot-device-sdk');

let iotDevice = null;
let iotData = null;
let socketIO = null;

// Initialize AWS IoT connection
const initializeAWSIoT = (io) => {
  try {
    socketIO = io;

    // Configure AWS SDK
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    // Initialize IoT Data client for publishing
    iotData = new AWS.IotData({
      endpoint: process.env.AWS_IOT_ENDPOINT
    });

    // Initialize IoT Device SDK for subscribing
    if (process.env.AWS_IOT_ENDPOINT && process.env.AWS_IOT_THING_NAME) {
      iotDevice = AWSIoTData.device({
        keyPath: './aws_certificate/763d836c18927e59bebd8cf25f966fe43b7ad7e6a1ed469efec374b2d1fb3b56-private.pem.key',
        certPath: './aws_certificate/a73d836c18927e59bebd8cf25f966fe43b7ad7e6a1ed469efec374b2d1fb3b56-certificate.pem.crt',
        caPath: './aws_certificate/AmazonRootCA1.pem',
        clientId: process.env.AWS_IOT_THING_NAME || 'webdashboard-client',
        host: process.env.AWS_IOT_ENDPOINT,
        region: process.env.AWS_REGION
      });

      setupIoTEventHandlers();
    } else {
      console.warn('⚠️  AWS IoT credentials not configured. Using mock data mode.');
      setupMockDataStream();
    }

  } catch (error) {
    console.error('❌ Failed to initialize AWS IoT:', error.message);
    console.log('📊 Falling back to mock data mode');
    setupMockDataStream();
  }
};

// Setup IoT device event handlers
const setupIoTEventHandlers = () => {
  iotDevice.on('connect', () => {
    console.log('✅ Connected to AWS IoT Core');
    
    // Subscribe to vehicle data topics
    const topics = [
      `dingli/mewp/${process.env.AWS_IOT_THING_NAME}/telemetry`,
      `dingli/mewp/${process.env.AWS_IOT_THING_NAME}/alerts`,
      `dingli/mewp/${process.env.AWS_IOT_THING_NAME}/status`,
      `test/topic`
    ];

    topics.forEach(topic => {
      iotDevice.subscribe(topic);
      console.log(`📡 Subscribed to topic: ${topic}`);
    });
  });

  iotDevice.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      console.log(`📨 Received message on topic ${topic}:`, data);
      
      // Process and forward data to connected clients
      processIoTMessage(topic, data);
    } catch (error) {
      console.error('❌ Error processing IoT message:', error);
    }
  });

  iotDevice.on('error', (error) => {
    console.error('❌ AWS IoT Device error:', error);
  });

  iotDevice.on('offline', () => {
    console.warn('⚠️  AWS IoT Device offline');
  });

  iotDevice.on('reconnect', () => {
    console.log('🔄 AWS IoT Device reconnecting...');
  });
};

// Process incoming IoT messages
const processIoTMessage = (topic, data) => {
  try {
    const topicParts = topic.split('/');
    const messageType = topicParts[topicParts.length - 1]; // telemetry, alerts, status

    const processedData = {
      timestamp: new Date().toISOString(),
      topic,
      messageType,
      vehicleId: data.vehicleId || process.env.AWS_IOT_THING_NAME,
      data: data,
      source: 'aws-iot'
    };

    // Emit to all connected clients
    if (socketIO) {
      socketIO.emit('vehicle-data', processedData);
      
      // Emit specific event types
      if (topic === 'test/topic') {
        socketIO.emit('aws-iot-message', processedData);
      } else {
        switch (messageType) {
          case 'telemetry':
            socketIO.emit('telemetry-update', processedData);
            break;
          case 'alerts':
            socketIO.emit('alert-notification', processedData);
            break;
          case 'status':
            socketIO.emit('status-update', processedData);
            break;
        }
      }
    }

    // Store data for historical analysis (implement database storage here)
    storeHistoricalData(processedData);

  } catch (error) {
    console.error('❌ Error processing IoT message:', error);
  }
};

// Setup mock data stream for development/demo
const setupMockDataStream = () => {
  console.log('🎭 Setting up mock data stream');
  
  // Generate mock telemetry data every 5 seconds
  setInterval(() => {
    const mockData = generateMockTelemetryData();
    const processedData = {
      timestamp: new Date().toISOString(),
      topic: `dingli/mewp/mock-device/telemetry`,
      messageType: 'telemetry',
      vehicleId: 'MEWP-001',
      data: mockData,
      source: 'mock'
    };

    if (socketIO) {
      socketIO.emit('vehicle-data', processedData);
      socketIO.emit('telemetry-update', processedData);
    }
  }, 5000);

  // Generate mock alerts occasionally
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance every 30 seconds
      const mockAlert = generateMockAlert();
      const processedData = {
        timestamp: new Date().toISOString(),
        topic: `dingli/mewp/mock-device/alerts`,
        messageType: 'alerts',
        vehicleId: 'MEWP-001',
        data: mockAlert,
        source: 'mock'
      };

      if (socketIO) {
        socketIO.emit('vehicle-data', processedData);
        socketIO.emit('alert-notification', processedData);
      }
    }
  }, 30000);
};

// Generate mock telemetry data
const generateMockTelemetryData = () => {
  return {
    engineRpm: 1800 + Math.random() * 400,
    engineTemperature: 80 + Math.random() * 25,
    hydraulicPressure: 2700 + Math.random() * 400,
    oilPressure: 40 + Math.random() * 15,
    batteryMonitor: 70 + Math.random() * 30,
    tilt: Math.random() * 10,
    angle: Math.random() * 45,
    overload: Math.random() < 0.05,
    lowFuel: Math.random() < 0.1,
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
      emergencyStop: Math.random() < 0.02
    },
    quality: Math.random() > 0.1 ? 'good' : 'poor',
    signalStrength: 70 + Math.random() * 30
  };
};

// Generate mock alert data
const generateMockAlert = () => {
  const alertTypes = [
    { parameter: 'engineTemperature', message: 'Engine temperature high', severity: 'high' },
    { parameter: 'batteryMonitor', message: 'Battery level low', severity: 'medium' },
    { parameter: 'hydraulicPressure', message: 'Hydraulic pressure fluctuation', severity: 'low' },
    { parameter: 'overload', message: 'Vehicle overload detected', severity: 'critical' }
  ];

  const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  
  return {
    id: `alert_${Date.now()}`,
    ...alert,
    timestamp: new Date().toISOString(),
    value: Math.random() * 100,
    active: true,
    acknowledged: false
  };
};

// Store historical data (implement database storage)
const storeHistoricalData = (data) => {
  // TODO: Implement database storage for historical data
  // This could be MongoDB, InfluxDB, or AWS Timestream
  console.log('📊 Storing historical data:', data.messageType);
};

// Publish message to AWS IoT
const publishToIoT = async (topic, message) => {
  try {
    if (!iotData) {
      throw new Error('AWS IoT Data client not initialized');
    }

    const params = {
      topic: topic,
      payload: JSON.stringify(message),
      qos: 1
    };

    const result = await iotData.publish(params).promise();
    console.log(`📤 Published message to topic ${topic}:`, result);
    return result;
  } catch (error) {
    console.error('❌ Error publishing to IoT:', error);
    throw error;
  }
};

// Get connection status
const getConnectionStatus = () => {
  return {
    connected: iotDevice ? iotDevice.connected : false,
    endpoint: process.env.AWS_IOT_ENDPOINT || 'not configured',
    thingName: process.env.AWS_IOT_THING_NAME || 'not configured',
    mode: iotDevice ? 'aws-iot' : 'mock'
  };
};

module.exports = {
  initializeAWSIoT,
  publishToIoT,
  getConnectionStatus,
  generateMockTelemetryData,
  generateMockAlert
};