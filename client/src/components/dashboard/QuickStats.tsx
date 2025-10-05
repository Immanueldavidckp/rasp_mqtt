import React from 'react';
import { useData } from '../../contexts/DataContext';
import './QuickStats.css';

const QuickStats: React.FC = () => {
  const { parameters, vehicleStatus, alerts, getActiveAlerts, getCriticalParameters } = useData();

  const activeAlerts = getActiveAlerts();
  const criticalParameters = getCriticalParameters();
  
  // Calculate statistics
  const totalParameters = parameters.length;
  const onlineStatus = vehicleStatus?.isOnline ? 'Online' : 'Offline';
  const batteryLevel = vehicleStatus?.batteryLevel || 0;
  const operatingHours = vehicleStatus?.operatingHours || 0;

  // Get specific parameter values
  const engineRPM = parameters.find(p => p.id === 'engine_rpm')?.value || 0;
  const fuelLevel = parameters.find(p => p.id === 'fuel_level')?.value || 0;
  const engineTemp = parameters.find(p => p.id === 'engine_temperature')?.value || 0;
  const hydraulicPressure = parameters.find(p => p.id === 'hydraulic_pressure')?.value || 0;

  const stats = [
    {
      id: 'vehicle-status',
      title: 'Vehicle Status',
      value: onlineStatus,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17C3 15.8954 3.89543 15 5 15C6.10457 15 7 15.8954 7 17Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 17C21 18.1046 20.1046 19 19 19C17.8954 19 17 18.1046 17 17C17 15.8954 17.8954 15 19 15C20.1046 15 21 15.8954 21 17Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 17H17M5 17H3V12L5 7H19L21 12V17H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: vehicleStatus?.isOnline ? '#22c55e' : '#ef4444',
      trend: vehicleStatus?.isOnline ? 'up' : 'down'
    },
    {
      id: 'battery-level',
      title: 'Battery Level',
      value: `${batteryLevel}%`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="23" y1="13" x2="23" y2="11" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="8" width={`${Math.max(2, (batteryLevel / 100) * 14)}`} height="8" rx="1" fill="currentColor"/>
        </svg>
      ),
      color: batteryLevel > 50 ? '#22c55e' : batteryLevel > 20 ? '#f59e0b' : '#ef4444',
      trend: batteryLevel > 75 ? 'up' : batteryLevel < 25 ? 'down' : 'stable'
    },
    {
      id: 'active-alerts',
      title: 'Active Alerts',
      value: activeAlerts.length.toString(),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.24 21H20.76A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: activeAlerts.length === 0 ? '#22c55e' : activeAlerts.length < 5 ? '#f59e0b' : '#ef4444',
      trend: activeAlerts.length === 0 ? 'up' : 'down'
    },
    {
      id: 'operating-hours',
      title: 'Operating Hours',
      value: `${operatingHours.toFixed(1)}h`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#667eea',
      trend: 'up'
    },
    {
      id: 'engine-rpm',
      title: 'Engine RPM',
      value: typeof engineRPM === 'number' ? engineRPM.toLocaleString() : engineRPM,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 1V9" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 12H13" stroke="currentColor" strokeWidth="2"/>
          <path d="M4.22 19.78L10.59 13.41" stroke="currentColor" strokeWidth="2"/>
          <path d="M1 12H9" stroke="currentColor" strokeWidth="2"/>
          <path d="M4.22 4.22L10.59 10.59" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#8b5cf6',
      trend: typeof engineRPM === 'number' && engineRPM > 1000 ? 'up' : 'stable'
    },
    {
      id: 'fuel-level',
      title: 'Fuel Level',
      value: typeof fuelLevel === 'number' ? `${fuelLevel}%` : fuelLevel,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="18" x2="6" y2="11" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="18" x2="10" y2="11" stroke="currentColor" strokeWidth="2"/>
          <line x1="14" y1="18" x2="14" y2="11" stroke="currentColor" strokeWidth="2"/>
          <line x1="18" y1="18" x2="18" y2="13" stroke="currentColor" strokeWidth="2"/>
          <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: typeof fuelLevel === 'number' && fuelLevel > 50 ? '#22c55e' : typeof fuelLevel === 'number' && fuelLevel > 20 ? '#f59e0b' : '#ef4444',
      trend: typeof fuelLevel === 'number' && fuelLevel > 75 ? 'up' : typeof fuelLevel === 'number' && fuelLevel < 25 ? 'down' : 'stable'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" fill="none"/>
            <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'down':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" stroke="currentColor" strokeWidth="2" fill="none"/>
            <polyline points="17,18 23,18 23,12" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return '#22c55e';
      case 'down':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="quick-stats">
      <div className="quick-stats-header">
        <h2>Quick Overview</h2>
        <div className="stats-summary">
          <span className="total-parameters">{totalParameters} Parameters</span>
          <span className="critical-count">
            {criticalParameters.length} Critical
          </span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-header">
              <div 
                className="stat-icon"
                style={{ color: stat.color }}
              >
                {stat.icon}
              </div>
              <div 
                className="stat-trend"
                style={{ color: getTrendColor(stat.trend) }}
              >
                {getTrendIcon(stat.trend)}
              </div>
            </div>
            
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-title">
                {stat.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Parameters Summary */}
      {criticalParameters.length > 0 && (
        <div className="critical-summary">
          <div className="critical-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.24 21H20.76A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Critical Parameters</span>
          </div>
          <div className="critical-list">
            {criticalParameters.slice(0, 3).map((param) => (
              <div key={param.id} className="critical-item">
                <span className="param-name">{param.name}</span>
                <span className={`param-status ${param.status}`}>
                  {param.status}
                </span>
              </div>
            ))}
            {criticalParameters.length > 3 && (
              <div className="critical-more">
                +{criticalParameters.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickStats;