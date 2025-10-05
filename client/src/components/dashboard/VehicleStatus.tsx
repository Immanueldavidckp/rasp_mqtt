import React from 'react';
import { useData } from '../../contexts/DataContext';
import './VehicleStatus.css';

const VehicleStatus: React.FC = () => {
  const { vehicleStatus, parameters } = useData();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'operational':
      case 'normal':
        return '#10b981';
      case 'warning':
      case 'maintenance':
        return '#f59e0b';
      case 'offline':
      case 'critical':
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getEngineStatus = () => {
    const engineRpm = parameters.find(p => p.name === 'Engine RPM');
    const engineTemp = parameters.find(p => p.name === 'Engine Temperature');
    
    if (!engineRpm || !engineTemp) return 'Unknown';
    
    const rpmValue = typeof engineRpm.value === 'number' ? engineRpm.value : 0;
    const tempValue = typeof engineTemp.value === 'number' ? engineTemp.value : 0;
    
    if (rpmValue > 0 && tempValue < 100) return 'Running';
    if (rpmValue === 0) return 'Stopped';
    if (tempValue >= 100) return 'Overheating';
    return 'Unknown';
  };

  const getFuelLevel = () => {
    const fuelParam = parameters.find(p => p.name === 'Fuel Level');
    return fuelParam ? `${fuelParam.value}%` : 'N/A';
  };

  const getBatteryLevel = () => {
    const batteryParam = parameters.find(p => p.name === 'Battery Voltage');
    return batteryParam ? `${batteryParam.value}V` : 'N/A';
  };

  const getLocation = () => {
    const latParam = parameters.find(p => p.name === 'GPS Latitude');
    const lonParam = parameters.find(p => p.name === 'GPS Longitude');
    
    if (latParam && lonParam && typeof latParam.value === 'number' && typeof lonParam.value === 'number') {
      return `${latParam.value.toFixed(4)}, ${lonParam.value.toFixed(4)}`;
    }
    return 'Location unavailable';
  };

  return (
    <div className="vehicle-status">
      <div className="vehicle-status-header">
        <h2>Vehicle Status</h2>
        <div className="status-indicator">
          <div 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor(vehicleStatus?.status || 'unknown') }}
          ></div>
          <span className="status-text">{vehicleStatus?.status || 'Unknown'}</span>
        </div>
      </div>

      <div className="status-grid">
        <div className="status-card">
          <div className="status-card-header">
            <div className="status-icon engine-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="M4.93 4.93l2.83 2.83"/>
                <path d="M16.24 16.24l2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="M4.93 19.07l2.83-2.83"/>
                <path d="M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h3>Engine</h3>
          </div>
          <div className="status-value">{getEngineStatus()}</div>
          <div className="status-details">
            RPM: {parameters.find(p => p.name === 'Engine RPM')?.value || 0}
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-header">
            <div className="status-icon fuel-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 22h18"/>
                <path d="M4 9h16"/>
                <path d="M6 2v6"/>
                <path d="M10 2v6"/>
                <path d="M14 2v6"/>
                <path d="M18 2v6"/>
              </svg>
            </div>
            <h3>Fuel</h3>
          </div>
          <div className="status-value">{getFuelLevel()}</div>
          <div className="status-details">
            Range: {vehicleStatus?.estimatedRange || 'N/A'} km
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-header">
            <div className="status-icon battery-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="6" width="18" height="12" rx="2"/>
                <path d="M23 13v-2"/>
              </svg>
            </div>
            <h3>Battery</h3>
          </div>
          <div className="status-value">{getBatteryLevel()}</div>
          <div className="status-details">
            Health: {vehicleStatus?.batteryHealth || 'Good'}
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-header">
            <div className="status-icon location-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3>Location</h3>
          </div>
          <div className="status-value">GPS Active</div>
          <div className="status-details">
            {getLocation()}
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-header">
            <div className="status-icon speed-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8"/>
                <path d="M12 8v8"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <h3>Speed</h3>
          </div>
          <div className="status-value">
            {parameters.find(p => p.name === 'Vehicle Speed')?.value || 0} km/h
          </div>
          <div className="status-details">
            Max today: {vehicleStatus?.maxSpeedToday || 0} km/h
          </div>
        </div>

        <div className="status-card">
          <div className="status-card-header">
            <div className="status-icon maintenance-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h3>Maintenance</h3>
          </div>
          <div className="status-value">
            {vehicleStatus?.nextMaintenanceKm || 5000} km
          </div>
          <div className="status-details">
            Last: {vehicleStatus?.lastMaintenanceDate || '2024-01-15'}
          </div>
        </div>
      </div>

      <div className="vehicle-info">
        <div className="info-row">
          <span className="info-label">Vehicle ID:</span>
          <span className="info-value">{vehicleStatus?.vehicleId || 'VH-001'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Odometer:</span>
          <span className="info-value">{vehicleStatus?.odometer || 45678} km</span>
        </div>
        <div className="info-row">
          <span className="info-label">Engine Hours:</span>
          <span className="info-value">{vehicleStatus?.engineHours || 1234} hrs</span>
        </div>
        <div className="info-row">
          <span className="info-label">Last Update:</span>
          <span className="info-value">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleStatus;