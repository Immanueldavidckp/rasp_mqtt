import React, { useState, useEffect } from 'react';
import './Settings.css';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  refreshInterval: number;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    autoRefresh: boolean;
    showGrid: boolean;
    compactMode: boolean;
    defaultView: string;
  };
  alerts: {
    soundEnabled: boolean;
    volume: number;
    criticalOnly: boolean;
    autoAcknowledge: boolean;
  };
}

interface SystemSettings {
  dataRetention: number;
  maxAlerts: number;
  apiTimeout: number;
  logLevel: string;
  backupEnabled: boolean;
  maintenanceMode: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'system' | 'about'>('user');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'auto',
    language: 'en',
    timezone: 'UTC',
    refreshInterval: 5000,
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      autoRefresh: true,
      showGrid: true,
      compactMode: false,
      defaultView: 'dashboard'
    },
    alerts: {
      soundEnabled: true,
      volume: 70,
      criticalOnly: false,
      autoAcknowledge: false
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    dataRetention: 30,
    maxAlerts: 1000,
    apiTimeout: 30000,
    logLevel: 'info',
    backupEnabled: true,
    maintenanceMode: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedUserSettings = localStorage.getItem('userSettings');
    const savedSystemSettings = localStorage.getItem('systemSettings');
    
    if (savedUserSettings) {
      setUserSettings(JSON.parse(savedUserSettings));
    }
    
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings));
    }
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [userSettings, systemSettings]);

  const handleUserSettingChange = (path: string, value: any) => {
    setUserSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSystemSettingChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    
    setHasChanges(false);
    setSaving(false);
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('userSettings');
      localStorage.removeItem('systemSettings');
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const settings = {
      user: userSettings,
      system: systemSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.user) setUserSettings(settings.user);
        if (settings.system) setSystemSettings(settings.system);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Error importing settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'user', label: 'User Preferences', icon: '👤' },
    { id: 'system', label: 'System Settings', icon: '⚙️' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Configure your dashboard preferences and system settings</p>
        </div>
        <div className="header-actions">
          <button onClick={exportSettings} className="export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <label className="import-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
            <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }} />
          </label>
          <button onClick={resetSettings} className="reset-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1,4 1,10 7,10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="tab-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'user' && (
            <div className="settings-section">
              <h2>User Preferences</h2>
              
              {/* Appearance */}
              <div className="setting-group">
                <h3>Appearance</h3>
                <div className="setting-item">
                  <label>Theme</label>
                  <select
                    value={userSettings.theme}
                    onChange={(e) => handleUserSettingChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Language</label>
                  <select
                    value={userSettings.language}
                    onChange={(e) => handleUserSettingChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Timezone</label>
                  <select
                    value={userSettings.timezone}
                    onChange={(e) => handleUserSettingChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>

              {/* Dashboard */}
              <div className="setting-group">
                <h3>Dashboard</h3>
                <div className="setting-item">
                  <label>Auto Refresh</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.dashboard.autoRefresh}
                      onChange={(e) => handleUserSettingChange('dashboard.autoRefresh', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Refresh Interval (ms)</label>
                  <input
                    type="number"
                    min="1000"
                    max="60000"
                    step="1000"
                    value={userSettings.refreshInterval}
                    onChange={(e) => handleUserSettingChange('refreshInterval', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Show Grid Lines</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.dashboard.showGrid}
                      onChange={(e) => handleUserSettingChange('dashboard.showGrid', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Compact Mode</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.dashboard.compactMode}
                      onChange={(e) => handleUserSettingChange('dashboard.compactMode', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Default View</label>
                  <select
                    value={userSettings.dashboard.defaultView}
                    onChange={(e) => handleUserSettingChange('dashboard.defaultView', e.target.value)}
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="vehicle-details">Vehicle Details</option>
                    <option value="historical-data">Historical Data</option>
                    <option value="alerts">Alerts</option>
                  </select>
                </div>
              </div>

              {/* Notifications */}
              <div className="setting-group">
                <h3>Notifications</h3>
                <div className="setting-item">
                  <label>Email Notifications</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.email}
                      onChange={(e) => handleUserSettingChange('notifications.email', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Push Notifications</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.push}
                      onChange={(e) => handleUserSettingChange('notifications.push', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>SMS Notifications</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.sms}
                      onChange={(e) => handleUserSettingChange('notifications.sms', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Alerts */}
              <div className="setting-group">
                <h3>Alert Settings</h3>
                <div className="setting-item">
                  <label>Sound Alerts</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.alerts.soundEnabled}
                      onChange={(e) => handleUserSettingChange('alerts.soundEnabled', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Alert Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userSettings.alerts.volume}
                    onChange={(e) => handleUserSettingChange('alerts.volume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-value">{userSettings.alerts.volume}%</span>
                </div>
                <div className="setting-item">
                  <label>Critical Alerts Only</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.alerts.criticalOnly}
                      onChange={(e) => handleUserSettingChange('alerts.criticalOnly', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Auto Acknowledge</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.alerts.autoAcknowledge}
                      onChange={(e) => handleUserSettingChange('alerts.autoAcknowledge', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              
              <div className="setting-group">
                <h3>Data Management</h3>
                <div className="setting-item">
                  <label>Data Retention (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={systemSettings.dataRetention}
                    onChange={(e) => handleSystemSettingChange('dataRetention', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Maximum Alerts</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={systemSettings.maxAlerts}
                    onChange={(e) => handleSystemSettingChange('maxAlerts', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>API Timeout (ms)</label>
                  <input
                    type="number"
                    min="5000"
                    max="120000"
                    step="5000"
                    value={systemSettings.apiTimeout}
                    onChange={(e) => handleSystemSettingChange('apiTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="setting-group">
                <h3>System Configuration</h3>
                <div className="setting-item">
                  <label>Log Level</label>
                  <select
                    value={systemSettings.logLevel}
                    onChange={(e) => handleSystemSettingChange('logLevel', e.target.value)}
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Backup Enabled</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={systemSettings.backupEnabled}
                      onChange={(e) => handleSystemSettingChange('backupEnabled', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>Maintenance Mode</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>About</h2>
              
              <div className="about-content">
                <div className="app-info">
                  <div className="app-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15.5c-1-1.4-3-2.5-5-2.5"/>
                      <path d="M16 8.5c-1-1.4-3-2.5-5-2.5s-4 1.1-5 2.5"/>
                    </svg>
                  </div>
                  <div className="app-details">
                    <h3>Vehicle Monitoring Dashboard</h3>
                    <p className="version">Version 1.0.0</p>
                    <p className="description">
                      A comprehensive vehicle monitoring and fleet management dashboard 
                      providing real-time data visualization, alerts, and analytics.
                    </p>
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-card">
                    <h4>Build Information</h4>
                    <div className="info-item">
                      <span className="label">Build Date:</span>
                      <span className="value">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Environment:</span>
                      <span className="value">Development</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Node Version:</span>
                      <span className="value">18.17.0</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>System Status</h4>
                    <div className="info-item">
                      <span className="label">Backend:</span>
                      <span className="value status online">Online</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Database:</span>
                      <span className="value status online">Connected</span>
                    </div>
                    <div className="info-item">
                      <span className="label">WebSocket:</span>
                      <span className="value status online">Active</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>Support</h4>
                    <div className="info-item">
                      <span className="label">Documentation:</span>
                      <a href="#" className="value link">View Docs</a>
                    </div>
                    <div className="info-item">
                      <span className="label">Support:</span>
                      <a href="mailto:support@example.com" className="value link">Contact Support</a>
                    </div>
                    <div className="info-item">
                      <span className="label">License:</span>
                      <span className="value">MIT License</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>Credits</h4>
                    <div className="info-item">
                      <span className="label">Developed by:</span>
                      <span className="value">M&T Development Team</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Framework:</span>
                      <span className="value">React 18.2.0</span>
                    </div>
                    <div className="info-item">
                      <span className="label">UI Library:</span>
                      <span className="value">Custom CSS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="save-bar">
          <div className="save-content">
            <span className="save-message">You have unsaved changes</span>
            <div className="save-actions">
              <button onClick={() => window.location.reload()} className="discard-btn">
                Discard
              </button>
              <button onClick={saveSettings} disabled={saving} className="save-btn">
                {saving ? (
                  <>
                    <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                        <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite" />
                      </circle>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;