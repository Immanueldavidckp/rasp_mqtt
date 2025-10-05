import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';

// Data interfaces based on the telematics requirements
export interface VehicleParameter {
  id: string;
  name: string;
  value: number | string | boolean;
  unit?: string;
  category: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  threshold?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
  description?: string;
  minValue?: number;
  maxValue?: number;
}

export interface Alert {
  id: string;
  parameter: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'warning' | 'info';
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  value?: number | string;
  threshold?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
  description?: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  value: number;
  parameter: string;
}

export interface VehicleStatus {
  vehicleId: string;
  isOnline: boolean;
  lastUpdate: string;
  batteryLevel: number;
  engineStatus: 'running' | 'idle' | 'off';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  operatingHours: number;
  alerts: Alert[];
  status?: 'normal' | 'warning' | 'critical';
  estimatedRange?: number;
  batteryHealth?: number;
  maxSpeedToday?: number;
  nextMaintenanceKm?: number;
  lastMaintenanceDate?: string;
  odometer?: number;
  engineHours?: number;
}

interface DataContextType {
  // Vehicle parameters and real-time data
  parameters: VehicleParameter[];
  vehicleStatus: VehicleStatus | null;
  alerts: Alert[];
  vehicleData?: {
    parameters: VehicleParameter[];
    status: VehicleStatus | null;
  };
  
  // Historical data
  historicalData: { [parameter: string]: HistoricalDataPoint[] };
  
  // Data loading states
  isLoading: boolean;
  error: string | null;
  
  // Data management functions
  updateParameter: (parameter: VehicleParameter) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  setHistoricalData: (parameter: string, data: HistoricalDataPoint[]) => void;
  
  // Data filtering and search
  getParametersByCategory: (category: string) => VehicleParameter[];
  getParameterById: (id: string) => VehicleParameter | undefined;
  getActiveAlerts: () => Alert[];
  getCriticalParameters: () => VehicleParameter[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parameters, setParameters] = useState<VehicleParameter[]>([]);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historicalData, setHistoricalDataState] = useState<{ [parameter: string]: HistoricalDataPoint[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected) {
      // Subscribe to real-time data updates
      const topics = [
        'vehicle-data',
        'alerts',
        'status-updates',
        'parameter-updates'
      ];
      
      // Set up socket event listeners
      socket.on('real-time-data', handleRealTimeData);
      socket.on('parameter-update', handleParameterUpdate);
      socket.on('new-alert', handleNewAlert);
      socket.on('alert-acknowledged', handleAlertAcknowledged);
      socket.on('vehicle-status', handleVehicleStatus);
      socket.on('historical-data-response', handleHistoricalDataResponse);
      socket.on('data-error', handleDataError);

      // Subscribe to topics
      socket.emit('subscribe', { topics });

      // Request initial data
      socket.emit('request-current-status');

      return () => {
        // Clean up event listeners
        socket.off('real-time-data', handleRealTimeData);
        socket.off('parameter-update', handleParameterUpdate);
        socket.off('new-alert', handleNewAlert);
        socket.off('alert-acknowledged', handleAlertAcknowledged);
        socket.off('vehicle-status', handleVehicleStatus);
        socket.off('historical-data-response', handleHistoricalDataResponse);
        socket.off('data-error', handleDataError);
      };
    }
  }, [socket, isConnected]);

  const handleRealTimeData = (data: any) => {
    console.log('📊 Real-time data received:', data);
    
    if (data.parameters && Array.isArray(data.parameters)) {
      setParameters(prevParams => {
        const updatedParams = [...prevParams];
        
        data.parameters.forEach((newParam: VehicleParameter) => {
          const existingIndex = updatedParams.findIndex(p => p.id === newParam.id);
          if (existingIndex >= 0) {
            updatedParams[existingIndex] = { ...updatedParams[existingIndex], ...newParam };
          } else {
            updatedParams.push(newParam);
          }
        });
        
        return updatedParams;
      });
    }
  };

  const handleParameterUpdate = (data: VehicleParameter) => {
    console.log('🔄 Parameter update received:', data);
    updateParameter(data);
  };

  const handleNewAlert = (alert: Alert) => {
    console.log('🚨 New alert received:', alert);
    addAlert(alert);
  };

  const handleAlertAcknowledged = (data: { alertId: string; acknowledgedBy: string; acknowledgedAt: string }) => {
    console.log('✅ Alert acknowledged:', data);
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === data.alertId 
          ? { ...alert, acknowledged: true, acknowledgedBy: data.acknowledgedBy, acknowledgedAt: data.acknowledgedAt }
          : alert
      )
    );
  };

  const handleVehicleStatus = (status: VehicleStatus) => {
    console.log('🚗 Vehicle status update:', status);
    setVehicleStatus(status);
  };

  const handleHistoricalDataResponse = (data: { parameter: string; data: HistoricalDataPoint[] }) => {
    console.log('📈 Historical data received:', data);
    setHistoricalData(data.parameter, data.data);
  };

  const handleDataError = (error: { message: string; code?: string }) => {
    console.error('❌ Data error:', error);
    setError(error.message);
  };

  const updateParameter = (parameter: VehicleParameter) => {
    setParameters(prevParams => {
      const existingIndex = prevParams.findIndex(p => p.id === parameter.id);
      if (existingIndex >= 0) {
        const updatedParams = [...prevParams];
        updatedParams[existingIndex] = { ...updatedParams[existingIndex], ...parameter };
        return updatedParams;
      } else {
        return [...prevParams, parameter];
      }
    });
  };

  const addAlert = (alert: Alert) => {
    setAlerts(prevAlerts => {
      // Check if alert already exists
      const existingAlert = prevAlerts.find(a => a.id === alert.id);
      if (existingAlert) {
        return prevAlerts;
      }
      return [alert, ...prevAlerts];
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : alert
      )
    );
  };

  const setHistoricalData = (parameter: string, data: HistoricalDataPoint[]) => {
    setHistoricalDataState(prevData => ({
      ...prevData,
      [parameter]: data
    }));
  };

  const getParametersByCategory = (category: string): VehicleParameter[] => {
    return parameters.filter(param => param.category === category);
  };

  const getParameterById = (id: string): VehicleParameter | undefined => {
    return parameters.find(param => param.id === id);
  };

  const getActiveAlerts = (): Alert[] => {
    return alerts.filter(alert => !alert.acknowledged);
  };

  const getCriticalParameters = (): VehicleParameter[] => {
    return parameters.filter(param => param.status === 'critical' || param.status === 'warning');
  };

  const value: DataContextType = {
    parameters,
    vehicleStatus,
    alerts,
    vehicleData: {
      parameters,
      status: vehicleStatus
    },
    historicalData,
    isLoading,
    error,
    updateParameter,
    addAlert,
    acknowledgeAlert,
    setHistoricalData,
    getParametersByCategory,
    getParameterById,
    getActiveAlerts,
    getCriticalParameters
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;