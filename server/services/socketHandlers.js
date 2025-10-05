const { generateMockTelemetryData, generateMockAlert } = require('./awsIoT');

let connectedClients = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Store client information
    connectedClients.set(socket.id, {
      id: socket.id,
      connectedAt: new Date(),
      subscriptions: new Set(),
      user: null
    });

    // Handle client authentication
    socket.on('authenticate', (data) => {
      try {
        const { token, user } = data;
        // In a real implementation, verify the JWT token here
        
        const client = connectedClients.get(socket.id);
        if (client) {
          client.user = user;
          socket.join(`user_${user.id}`);
          console.log(`✅ Client ${socket.id} authenticated as ${user.username}`);
          
          socket.emit('authentication-success', {
            message: 'Successfully authenticated',
            clientId: socket.id,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Authentication error:', error);
        socket.emit('authentication-error', {
          error: 'Authentication failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle subscription to specific data streams
    socket.on('subscribe', (data) => {
      try {
        const { topics } = data;
        const client = connectedClients.get(socket.id);
        
        if (client && Array.isArray(topics)) {
          topics.forEach(topic => {
            client.subscriptions.add(topic);
            socket.join(topic);
          });
          
          console.log(`📡 Client ${socket.id} subscribed to:`, topics);
          
          socket.emit('subscription-success', {
            topics,
            message: 'Successfully subscribed to topics',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Subscription error:', error);
        socket.emit('subscription-error', {
          error: 'Subscription failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle unsubscription from data streams
    socket.on('unsubscribe', (data) => {
      try {
        const { topics } = data;
        const client = connectedClients.get(socket.id);
        
        if (client && Array.isArray(topics)) {
          topics.forEach(topic => {
            client.subscriptions.delete(topic);
            socket.leave(topic);
          });
          
          console.log(`📡 Client ${socket.id} unsubscribed from:`, topics);
          
          socket.emit('unsubscription-success', {
            topics,
            message: 'Successfully unsubscribed from topics',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Unsubscription error:', error);
        socket.emit('unsubscription-error', {
          error: 'Unsubscription failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle request for current vehicle status
    socket.on('request-current-status', () => {
      try {
        const currentStatus = {
          timestamp: new Date().toISOString(),
          vehicleId: 'MEWP-001',
          telemetry: generateMockTelemetryData(),
          alerts: [],
          connectionStatus: 'connected',
          dataQuality: 'good'
        };

        socket.emit('current-status', currentStatus);
      } catch (error) {
        console.error('❌ Error sending current status:', error);
        socket.emit('status-error', {
          error: 'Failed to get current status',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle request for historical data
    socket.on('request-historical-data', (data) => {
      try {
        const { parameter, timeRange, interval } = data;
        
        // Generate mock historical data
        const historicalData = generateHistoricalDataPoints(parameter, timeRange, interval);
        
        socket.emit('historical-data', {
          parameter,
          timeRange,
          interval,
          data: historicalData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error sending historical data:', error);
        socket.emit('historical-data-error', {
          error: 'Failed to get historical data',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle alert acknowledgment
    socket.on('acknowledge-alert', (data) => {
      try {
        const { alertId, userId } = data;
        
        // In a real implementation, update the alert in the database
        console.log(`✅ Alert ${alertId} acknowledged by user ${userId}`);
        
        // Broadcast to all clients
        io.emit('alert-acknowledged', {
          alertId,
          acknowledgedBy: userId,
          acknowledgedAt: new Date().toISOString()
        });
        
        socket.emit('acknowledgment-success', {
          alertId,
          message: 'Alert acknowledged successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error acknowledging alert:', error);
        socket.emit('acknowledgment-error', {
          error: 'Failed to acknowledge alert',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle parameter threshold updates
    socket.on('update-threshold', (data) => {
      try {
        const { parameter, threshold, userId } = data;
        
        console.log(`🔧 Threshold updated for ${parameter}: ${threshold} by user ${userId}`);
        
        // Broadcast to all clients
        io.emit('threshold-updated', {
          parameter,
          threshold,
          updatedBy: userId,
          updatedAt: new Date().toISOString()
        });
        
        socket.emit('threshold-update-success', {
          parameter,
          threshold,
          message: 'Threshold updated successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error updating threshold:', error);
        socket.emit('threshold-update-error', {
          error: 'Failed to update threshold',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
      
      const client = connectedClients.get(socket.id);
      if (client && client.user) {
        console.log(`👤 User ${client.user.username} disconnected`);
      }
      
      connectedClients.delete(socket.id);
    });

    // Send welcome message
    socket.emit('connection-established', {
      clientId: socket.id,
      serverTime: new Date().toISOString(),
      message: 'Connected to Dingli MEWP Dashboard'
    });
  });

  // Periodic connection status broadcast
  setInterval(() => {
    const connectionStats = {
      totalConnections: connectedClients.size,
      authenticatedUsers: Array.from(connectedClients.values()).filter(c => c.user).length,
      timestamp: new Date().toISOString()
    };
    
    io.emit('connection-stats', connectionStats);
  }, 30000); // Every 30 seconds
};

// Generate mock historical data points
const generateHistoricalDataPoints = (parameter, timeRange = '24h', interval = '1h') => {
  const data = [];
  const now = new Date();
  
  // Parse time range
  const rangeHours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24;
  const intervalMinutes = interval === '1h' ? 60 : interval === '30m' ? 30 : 60;
  
  const points = Math.floor((rangeHours * 60) / intervalMinutes);
  
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
    
    let value;
    switch (parameter) {
      case 'engineRpm':
        value = 1800 + Math.random() * 400;
        break;
      case 'engineTemperature':
        value = 80 + Math.random() * 20;
        break;
      case 'hydraulicPressure':
        value = 2700 + Math.random() * 400;
        break;
      case 'oilPressure':
        value = 40 + Math.random() * 15;
        break;
      case 'batteryMonitor':
        value = 70 + Math.random() * 30;
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
};

// Get connected clients information
const getConnectedClients = () => {
  return Array.from(connectedClients.values()).map(client => ({
    id: client.id,
    connectedAt: client.connectedAt,
    user: client.user ? {
      id: client.user.id,
      username: client.user.username,
      role: client.user.role
    } : null,
    subscriptions: Array.from(client.subscriptions)
  }));
};

// Broadcast message to all clients
const broadcastToAll = (event, data) => {
  const message = {
    ...data,
    timestamp: new Date().toISOString()
  };
  
  io.emit(event, message);
};

// Broadcast message to specific user role
const broadcastToRole = (role, event, data) => {
  const message = {
    ...data,
    timestamp: new Date().toISOString()
  };
  
  connectedClients.forEach((client, socketId) => {
    if (client.user && client.user.role === role) {
      io.to(socketId).emit(event, message);
    }
  });
};

module.exports = {
  setupSocketHandlers,
  getConnectedClients,
  broadcastToAll,
  broadcastToRole
};