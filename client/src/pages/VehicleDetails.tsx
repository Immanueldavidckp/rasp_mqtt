import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import './VehicleDetails.css';

const VehicleDetails: React.FC = () => {
  const { parameters, vehicleStatus } = useData();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Group parameters by category
  const parametersByCategory = React.useMemo(() => {
    const grouped: { [key: string]: typeof parameters } = {};
    
    parameters.forEach(param => {
      if (!grouped[param.category]) {
        grouped[param.category] = [];
      }
      grouped[param.category].push(param);
    });

    return grouped;
  }, [parameters]);

  const categories = Object.keys(parametersByCategory);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'ok':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatValue = (value: any, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const filteredParameters = selectedCategory === 'all' 
    ? parameters 
    : parametersByCategory[selectedCategory] || [];

  return (
    <div className="vehicle-details">
      <div className="page-header">
        <h1>Vehicle Details</h1>
        <div className="vehicle-info-summary">
          <div className="info-card">
            <span className="label">Vehicle ID</span>
            <span className="value">{vehicleStatus?.vehicleId || 'VH-001'}</span>
          </div>
          <div className="info-card">
            <span className="label">Status</span>
            <span className="value" style={{ color: getStatusColor(vehicleStatus?.status || 'unknown') }}>
              {vehicleStatus?.status || 'Unknown'}
            </span>
          </div>
          <div className="info-card">
            <span className="label">Odometer</span>
            <span className="value">{vehicleStatus?.odometer || 0} km</span>
          </div>
          <div className="info-card">
            <span className="label">Engine Hours</span>
            <span className="value">{vehicleStatus?.engineHours || 0} hrs</span>
          </div>
        </div>
      </div>

      <div className="details-content">
        <div className="category-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Parameters ({parameters.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({parametersByCategory[category].length})
              </button>
            ))}
          </div>
        </div>

        <div className="parameters-grid">
          {filteredParameters.map(param => (
            <div key={param.id} className={`parameter-card ${param.status.toLowerCase()}`}>
              <div className="parameter-header">
                <h4 className="parameter-name">{param.name}</h4>
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(param.status) }}
                ></div>
              </div>

              <div className="parameter-value">
                <span className="value">{formatValue(param.value, param.unit)}</span>
                {param.threshold?.min !== undefined && param.threshold?.max !== undefined && (
                  <div className="value-range">
                    <div className="range-bar">
                      <div 
                        className="range-fill"
                        style={{
                          width: `${((param.value as number - param.threshold.min) / (param.threshold.max - param.threshold.min)) * 100}%`,
                          backgroundColor: getStatusColor(param.status)
                        }}
                      ></div>
                    </div>
                    <div className="range-labels">
                      <span>{param.threshold.min}</span>
                      <span>{param.threshold.max}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="parameter-details">
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{param.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value" style={{ color: getStatusColor(param.status) }}>
                    {param.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">
                    {new Date(param.timestamp).toLocaleString()}
                  </span>
                </div>
                {param.description && (
                  <div className="parameter-description">
                    {param.description}
                  </div>
                )}
              </div>

              {(param.threshold?.min !== undefined || param.threshold?.max !== undefined) && (
                <div className="parameter-thresholds">
                  <h5>Thresholds</h5>
                  <div className="threshold-list">
                    {param.threshold?.min !== undefined && (
                      <div className="threshold-item">
                        <span className="threshold-label">Minimum:</span>
                        <span className="threshold-value">{param.threshold.min} {param.unit}</span>
                      </div>
                    )}
                    {param.threshold?.max !== undefined && (
                      <div className="threshold-item">
                        <span className="threshold-label">Maximum:</span>
                        <span className="threshold-value">{param.threshold.max} {param.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {filteredParameters.length === 0 && (
        <div className="no-parameters">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No parameters found</h3>
          <p>No parameters available for the selected category</p>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;