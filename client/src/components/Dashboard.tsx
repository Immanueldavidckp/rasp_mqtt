import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useSocket } from '../contexts/SocketContext';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';
import AwsIotMessageDisplay from './AwsIotMessageDisplay';

// Import dashboard components (to be created)
import VehicleStatus from './dashboard/VehicleStatus';
import LiveDataGrid from './dashboard/LiveDataGrid';
import AlertsPanel from './dashboard/AlertsPanel';
import QuickStats from './dashboard/QuickStats';

const Dashboard: React.FC = () => {
  const { vehicleStatus, parameters, alerts, getActiveAlerts, getCriticalParameters } = useData();
  const { isConnected, connectionError } = useSocket();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeAlerts = getActiveAlerts();
  const criticalParameters = getCriticalParameters();

  const navigationItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      path: '/vehicle',
      name: 'Vehicle Details',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17C3 15.8954 3.89543 15 5 15C6.10457 15 7 15.8954 7 17Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 17C21 18.1046 20.1046 19 19 19C17.8954 19 17 18.1046 17 17C17 15.8954 17.8954 15 19 15C20.1046 15 21 15.8954 21 17Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 17H17M5 17H3V12L5 7H19L21 12V17H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 7V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      path: '/historical',
      name: 'Historical Data',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 12L12 7L16 11L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      path: '/alerts',
      name: 'Alerts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.24 21H20.76A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      badge: activeAlerts.length > 0 ? activeAlerts.length : undefined
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M19.4 15A1.65 1.65 0 0 0 19 14.34L20.25 12.74A1.65 1.65 0 0 0 20.25 11.26L19 9.66A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 18.76 8.25L17.16 7A1.65 1.65 0 0 0 15.74 7L14.34 5.75A1.65 1.65 0 0 0 12.74 5.75L11.26 7A1.65 1.65 0 0 0 9.66 7L8.25 8.25A1.65 1.65 0 0 0 7.6 9A1.65 1.65 0 0 0 8 9.66L6.75 11.26A1.65 1.65 0 0 0 6.75 12.74L8 14.34A1.65 1.65 0 0 0 7.6 15A1.65 1.65 0 0 0 8.25 15.75L9.66 17A1.65 1.65 0 0 0 11.26 17L12.74 18.25A1.65 1.65 0 0 0 14.34 18.25L15.74 17A1.65 1.65 0 0 0 17.16 17L18.76 15.75A1.65 1.65 0 0 0 19.4 15Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Dingli MEWP</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">G</div>
            <div className="user-details">
              <div className="user-name">Guest User</div>
              <div className="user-role">Viewer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <h1>Dashboard</h1>
          </div>

          <div className="header-right">
            <div className="connection-status">
              <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                <div className="status-dot"></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {connectionError && (
                <div className="connection-error" title={connectionError}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="current-time">
              {currentTime.toLocaleTimeString()}
            </div>

            <div className="vehicle-status-indicator">
              <div className={`vehicle-indicator ${vehicleStatus?.isOnline ? 'online' : 'offline'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17C3 15.8954 3.89543 15 5 15C6.10457 15 7 15.8954 7 17Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 17C21 18.1046 20.1046 19 19 19C17.8954 19 17 18.1046 17 17C17 15.8954 17.8954 15 19 15C20.1046 15 21 15.8954 21 17Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 17H17M5 17H3V12L5 7H19L21 12V17H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{vehicleStatus?.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Quick Stats Row */}
          <QuickStats />

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Vehicle Status Card */}
            <div className="dashboard-card vehicle-status-card">
              <VehicleStatus />
            </div>

            {/* Live Data Grid */}
            <div className="dashboard-card live-data-card">
              <LiveDataGrid />
            </div>

            {/* AWS IoT Messages */}
            <div className="dashboard-card aws-iot-card">
              <AwsIotMessageDisplay />
            </div>

            {/* Alerts Panel */}
            <div className="dashboard-card alerts-card">
              <AlertsPanel />
            </div>
          </div>

          {/* Critical Parameters Alert */}
          {criticalParameters.length > 0 && (
            <div className="critical-alert-banner">
              <div className="alert-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.24 21H20.76A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="alert-content">
                <strong>Critical Parameters Detected!</strong>
                <span>{criticalParameters.length} parameter(s) require immediate attention.</span>
              </div>
              <Link to="/alerts" className="alert-action">
                View Details
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;