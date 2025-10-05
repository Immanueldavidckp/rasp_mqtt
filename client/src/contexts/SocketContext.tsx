import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  subscribe: (topics: string[]) => void;
  unsubscribe: (topics: string[]) => void;
  requestCurrentStatus: () => void;
  requestHistoricalData: (parameter: string, timeRange: string, interval: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  updateThreshold: (parameter: string, threshold: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Subscription response handlers
    newSocket.on('subscription-success', (data) => {
      console.log('📡 Subscribed to topics:', data.topics);
    });

    newSocket.on('subscription-error', (data) => {
      console.error('❌ Subscription failed:', data.error);
    });

    // Connection establishment
    newSocket.on('connection-established', (data) => {
      console.log('🎉 Connection established:', data.message);
    });

    // Ping/Pong for connection health
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds

    newSocket.on('pong', (data) => {
      // Connection is healthy
      console.log('🏓 Pong received, connection healthy');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const subscribe = (topics: string[]) => {
    if (socket && isConnected) {
      socket.emit('subscribe', { topics });
    } else {
      console.warn('⚠️ Cannot subscribe: Socket not connected');
    }
  };

  const unsubscribe = (topics: string[]) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe', { topics });
    } else {
      console.warn('⚠️ Cannot unsubscribe: Socket not connected');
    }
  };

  const requestCurrentStatus = () => {
    if (socket && isConnected) {
      socket.emit('request-current-status');
    } else {
      console.warn('⚠️ Cannot request status: Socket not connected');
    }
  };

  const requestHistoricalData = (parameter: string, timeRange: string, interval: string) => {
    if (socket && isConnected) {
      socket.emit('request-historical-data', { parameter, timeRange, interval });
    } else {
      console.warn('⚠️ Cannot request historical data: Socket not connected');
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    if (socket && isConnected) {
      socket.emit('acknowledge-alert', { alertId });
    } else {
      console.warn('⚠️ Cannot acknowledge alert: Socket not connected');
    }
  };

  const updateThreshold = (parameter: string, threshold: number) => {
    if (socket && isConnected) {
      socket.emit('update-threshold', { parameter, threshold });
    } else {
      console.warn('⚠️ Cannot update threshold: Socket not connected');
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
    requestCurrentStatus,
    requestHistoricalData,
    acknowledgeAlert,
    updateThreshold
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;