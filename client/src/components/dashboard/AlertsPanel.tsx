import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useSocket } from '../../contexts/SocketContext';
import './AlertsPanel.css';

const AlertsPanel: React.FC = () => {
  const { alerts } = useData();
  const { acknowledgeAlert } = useSocket();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Filter alerts based on selected criteria
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesFilter = filter === 'all' || alert.severity === filter;
      const matchesAcknowledged = showAcknowledged || !alert.acknowledged;
      return matchesFilter && matchesAcknowledged;
    });
  }, [alerts, filter, showAcknowledged]);

  // Group alerts by severity for summary
  const alertSummary = useMemo(() => {
    const summary = {
      critical: 0,
      warning: 0,
      info: 0,
      total: 0
    };

    alerts.forEach(alert => {
      if (!alert.acknowledged) {
        summary[alert.severity as keyof typeof summary]++;
        summary.total++;
      }
    });

    return summary;
  }, [alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
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
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
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
    <div className="alerts-panel">
      <div className="alerts-header">
        <h2>Alerts & Notifications</h2>
        <div className="alerts-summary">
          <div className="summary-item critical">
            <span className="count">{alertSummary.critical}</span>
            <span className="label">Critical</span>
          </div>
          <div className="summary-item warning">
            <span className="count">{alertSummary.warning}</span>
            <span className="label">Warning</span>
          </div>
          <div className="summary-item info">
            <span className="count">{alertSummary.info}</span>
            <span className="label">Info</span>
          </div>
        </div>
      </div>

      <div className="alerts-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({filteredAlerts.length})
          </button>
          <button
            className={`filter-btn critical ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical
          </button>
          <button
            className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Warning
          </button>
          <button
            className={`filter-btn info ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
          >
            Info
          </button>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
          />
          <span className="checkmark"></span>
          Show acknowledged
        </label>
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <h3>No alerts</h3>
            <p>All systems are operating normally</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}
            >
              <div className="alert-icon" style={{ color: getSeverityColor(alert.severity) }}>
                {getSeverityIcon(alert.severity)}
              </div>

              <div className="alert-content">
                <div className="alert-header">
                  <h4 className="alert-title">{alert.message}</h4>
                  <span className="alert-time">{formatTimestamp(alert.timestamp)}</span>
                </div>

                <div className="alert-details">
                  <span className="alert-parameter">Parameter: {alert.parameter}</span>
                  {alert.value !== undefined && (
                    <span className="alert-value">Value: {alert.value}</span>
                  )}
                  {alert.threshold !== undefined && (
                    <span className="alert-threshold">
                      Threshold: {alert.threshold.warning || alert.threshold.critical || alert.threshold.min || alert.threshold.max || 'N/A'}
                    </span>
                  )}
                </div>

                {alert.description && (
                  <p className="alert-description">{alert.description}</p>
                )}

                <div className="alert-actions">
                  {!alert.acknowledged && (
                    <button
                      className="acknowledge-btn"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Acknowledge
                    </button>
                  )}
                  
                  <div className="alert-severity-badge" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
                    {alert.severity.toUpperCase()}
                  </div>
                </div>
              </div>

              {alert.acknowledged && (
                <div className="acknowledged-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {filteredAlerts.length > 0 && (
        <div className="alerts-footer">
          <span className="showing-count">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
          {alertSummary.total > 0 && (
            <button className="clear-all-btn">
              Clear All Acknowledged
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;