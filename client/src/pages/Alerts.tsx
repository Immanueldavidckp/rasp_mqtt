import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import './Alerts.css';

interface AlertRule {
  id: string;
  parameter: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  description: string;
}

const Alerts: React.FC = () => {
  const { alerts } = useData();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      parameter: 'Engine Temperature',
      condition: 'greater_than',
      threshold: 95,
      severity: 'critical',
      enabled: true,
      description: 'Engine overheating alert'
    },
    {
      id: '2',
      parameter: 'Fuel Level',
      condition: 'less_than',
      threshold: 10,
      severity: 'warning',
      enabled: true,
      description: 'Low fuel warning'
    },
    {
      id: '3',
      parameter: 'Battery Voltage',
      condition: 'less_than',
      threshold: 11.5,
      severity: 'critical',
      enabled: true,
      description: 'Low battery voltage'
    },
    {
      id: '4',
      parameter: 'Oil Pressure',
      condition: 'less_than',
      threshold: 20,
      severity: 'warning',
      enabled: true,
      description: 'Low oil pressure'
    },
    {
      id: '5',
      parameter: 'Speed',
      condition: 'greater_than',
      threshold: 80,
      severity: 'info',
      enabled: false,
      description: 'Speed limit exceeded'
    }
  ]);

  // Filter alerts based on criteria
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'acknowledged' && alert.acknowledged) ||
      (filterStatus === 'unacknowledged' && !alert.acknowledged);
    const matchesSearch = searchTerm === '' || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.parameter.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  // Group alerts by severity
  const alertsBySeverity = {
    critical: filteredAlerts.filter(a => a.severity === 'critical'),
    warning: filteredAlerts.filter(a => a.severity === 'warning'),
    info: filteredAlerts.filter(a => a.severity === 'info')
  };

  // Get alert statistics
  const getAlertStats = () => {
    const total = alerts.length;
    const unacknowledged = alerts.filter(a => !a.acknowledged).length;
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warning = alerts.filter(a => a.severity === 'warning').length;
    const info = alerts.filter(a => a.severity === 'info').length;
    
    return { total, unacknowledged, critical, warning, info };
  };

  const stats = getAlertStats();

  const handleAcknowledgeAll = () => {
    // In a real app, this would call an API
    console.log('Acknowledging all alerts');
  };

  const handleClearAcknowledged = () => {
    // In a real app, this would call an API
    console.log('Clearing acknowledged alerts');
  };

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Alerts & Notifications</h1>
          <p>Monitor and manage vehicle alerts and warning conditions</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowRules(!showRules)}
            className="rules-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Alert Rules
          </button>
          <button onClick={handleAcknowledgeAll} className="acknowledge-all-btn">
            Acknowledge All
          </button>
          <button onClick={handleClearAcknowledged} className="clear-btn">
            Clear Acknowledged
          </button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="alert-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon unacknowledged">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.unacknowledged}</div>
            <div className="stat-label">Unacknowledged</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon critical">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.warning}</div>
            <div className="stat-label">Warning</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.info}</div>
            <div className="stat-label">Info</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Severity:</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="unacknowledged">Unacknowledged</option>
          </select>
        </div>
      </div>

      {/* Alert Rules Panel */}
      {showRules && (
        <div className="rules-panel">
          <div className="rules-header">
            <h3>Alert Rules Configuration</h3>
            <button onClick={() => setShowRules(false)} className="close-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="rules-list">
            {alertRules.map(rule => (
              <div key={rule.id} className={`rule-item ${rule.enabled ? 'enabled' : 'disabled'}`}>
                <div className="rule-info">
                  <div className="rule-header">
                    <span className={`severity-badge ${rule.severity}`}>
                      {getSeverityIcon(rule.severity)}
                      {rule.severity.toUpperCase()}
                    </span>
                    <span className="rule-parameter">{rule.parameter}</span>
                  </div>
                  <div className="rule-condition">
                    {rule.parameter} {rule.condition.replace('_', ' ')} {rule.threshold}
                  </div>
                  <div className="rule-description">{rule.description}</div>
                </div>
                <div className="rule-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="alerts-content">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <h3>No Alerts Found</h3>
            <p>No alerts match your current filter criteria</p>
          </div>
        ) : (
          <div className="alerts-list">
            {Object.entries(alertsBySeverity).map(([severity, severityAlerts]) => (
              severityAlerts.length > 0 && (
                <div key={severity} className="severity-group">
                  <div className="severity-header">
                    <div className={`severity-icon ${severity}`}>
                      {getSeverityIcon(severity)}
                    </div>
                    <h3>{severity.charAt(0).toUpperCase() + severity.slice(1)} ({severityAlerts.length})</h3>
                  </div>
                  <div className="alerts-grid">
                    {severityAlerts.map(alert => (
                      <div key={alert.id} className={`alert-card ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}>
                        <div className="alert-header">
                          <div className="alert-severity">
                            {getSeverityIcon(alert.severity)}
                            <span>{alert.severity.toUpperCase()}</span>
                          </div>
                          <div className="alert-timestamp">
                            {formatTimestamp(alert.timestamp)}
                          </div>
                        </div>
                        
                        <div className="alert-content">
                          <div className="alert-parameter">{alert.parameter}</div>
                          <div className="alert-message">{alert.message}</div>
                          {alert.value !== undefined && (
                            <div className="alert-value">
                              Current Value: <span>{alert.value}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="alert-actions">
                          {!alert.acknowledged && (
                            <button className="acknowledge-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                              Acknowledge
                            </button>
                          )}
                          <button className="details-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="16" x2="12" y2="12"/>
                              <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            Details
                          </button>
                        </div>
                        
                        {alert.acknowledged && (
                          <div className="acknowledged-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            Acknowledged
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;