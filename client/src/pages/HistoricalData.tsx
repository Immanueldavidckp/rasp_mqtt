import React, { useState, useEffect, useContext } from 'react';
import { useData } from '../contexts/DataContext';
import './HistoricalData.css';

interface HistoricalDataPoint {
  timestamp: string;
  value: number;
  parameter: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

const HistoricalData: React.FC = () => {
  const { vehicleData } = useData();
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aggregation, setAggregation] = useState<'hourly' | 'daily' | 'raw'>('hourly');

  // Generate mock historical data based on current parameters
  const parameters = vehicleData?.parameters || [];

  // Get available parameters for selection
  const availableParameters = parameters.filter(param => 
    param.category !== 'status'
  ).map(param => param.name);

  // Generate mock historical data
  const generateHistoricalData = (parameterName: string, days: number): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const param = parameters.find(p => p.name === parameterName);
    const baseValue = typeof param?.value === 'number' ? param.value : 50;
    const variance = baseValue * 0.2; // 20% variance
    
    for (let i = 0; i < days * 24; i++) {
      const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const randomVariation = (Math.random() - 0.5) * variance;
      const trendVariation = Math.sin(i / 12) * (variance * 0.3); // Daily cycle
      const value = Math.max(0, baseValue + randomVariation + trendVariation);
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.round(value * 100) / 100,
        parameter: parameterName
      });
    }
    
    return data;
  };

  // Aggregate data based on selected aggregation
  const aggregateData = (data: HistoricalDataPoint[], type: 'hourly' | 'daily' | 'raw') => {
    if (type === 'raw') return data;
    
    const grouped: { [key: string]: HistoricalDataPoint[] } = {};
    
    data.forEach(point => {
      const date = new Date(point.timestamp);
      let key: string;
      
      if (type === 'hourly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(point);
    });
    
    return Object.entries(grouped).map(([timestamp, points]) => ({
      timestamp,
      value: points.reduce((sum, p) => sum + p.value, 0) / points.length,
      parameter: points[0].parameter
    }));
  };

  // Load historical data
  const loadHistoricalData = async () => {
    if (!selectedParameter) return;
    
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const rawData = generateHistoricalData(selectedParameter, daysDiff);
    const aggregatedData = aggregateData(rawData, aggregation);
    
    setHistoricalData(aggregatedData);
    setLoading(false);
  };

  // Prepare chart data
  useEffect(() => {
    if (historicalData.length === 0) {
      setChartData(null);
      return;
    }

    const labels = historicalData.map(point => {
      const date = new Date(point.timestamp);
      if (aggregation === 'daily') {
        return date.toLocaleDateString();
      } else if (aggregation === 'hourly') {
        return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' });
      } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    });

    const data = historicalData.map(point => point.value);
    const parameterInfo = parameters.find(p => p.name === selectedParameter);
    
    setChartData({
      labels,
      datasets: [{
        label: `${selectedParameter} (${parameterInfo?.unit || ''})`,
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    });
  }, [historicalData, selectedParameter, parameters, aggregation]);

  // Load data when parameters change
  useEffect(() => {
    if (selectedParameter && availableParameters.includes(selectedParameter)) {
      loadHistoricalData();
    }
  }, [selectedParameter, dateRange, aggregation]);

  // Set default parameter
  useEffect(() => {
    if (availableParameters.length > 0 && !selectedParameter) {
      setSelectedParameter(availableParameters[0]);
    }
  }, [availableParameters, selectedParameter]);

  const getStatistics = () => {
    if (historicalData.length === 0) return null;
    
    const values = historicalData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];
    const previous = values[values.length - 2] || latest;
    const change = latest - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
    
    return { min, max, avg, latest, change, changePercent };
  };

  const stats = getStatistics();

  return (
    <div className="historical-data">
      <div className="page-header">
        <h1>Historical Data</h1>
        <p>View and analyze historical vehicle parameter data over time</p>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="parameter-select">Parameter:</label>
          <select
            id="parameter-select"
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            className="parameter-select"
          >
            <option value="">Select a parameter</option>
            {availableParameters.map(param => {
              const paramInfo = parameters.find(p => p.name === param);
              return (
                <option key={param} value={param}>
                  {param} ({paramInfo?.unit || ''})
                </option>
              );
            })}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="date-input"
          />
        </div>

        <div className="control-group">
          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="date-input"
          />
        </div>

        <div className="control-group">
          <label htmlFor="aggregation-select">Aggregation:</label>
          <select
            id="aggregation-select"
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as 'hourly' | 'daily' | 'raw')}
            className="aggregation-select"
          >
            <option value="raw">Raw Data</option>
            <option value="hourly">Hourly Average</option>
            <option value="daily">Daily Average</option>
          </select>
        </div>

        <button
          onClick={loadHistoricalData}
          disabled={!selectedParameter || loading}
          className="refresh-btn"
        >
          {loading ? (
            <>
              <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                  <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite" />
                </circle>
              </svg>
              Loading...
            </>
          ) : (
            'Refresh Data'
          )}
        </button>
      </div>

      {stats && (
        <div className="statistics-section">
          <div className="stat-card">
            <div className="stat-label">Current Value</div>
            <div className="stat-value">
              {stats.latest.toFixed(2)}
              <span className={`change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)} ({stats.changePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average</div>
            <div className="stat-value">{stats.avg.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Minimum</div>
            <div className="stat-value">{stats.min.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Maximum</div>
            <div className="stat-value">{stats.max.toFixed(2)}</div>
          </div>
        </div>
      )}

      <div className="chart-section">
        {loading ? (
          <div className="loading-state">
            <svg className="loading-spinner large" width="48" height="48" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite" />
              </circle>
            </svg>
            <p>Loading historical data...</p>
          </div>
        ) : chartData ? (
          <div className="chart-container">
            <div className="chart-header">
              <h3>{selectedParameter} Over Time</h3>
              <div className="chart-info">
                <span className="data-points">{historicalData.length} data points</span>
                <span className="date-range">
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Simple SVG chart representation */}
            <div className="simple-chart">
              <svg width="100%" height="300" viewBox="0 0 800 300">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={`grid-${i}`}
                    x1="50"
                    y1={50 + i * 50}
                    x2="750"
                    y2={50 + i * 50}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Chart line */}
                {chartData.datasets[0].data.length > 1 && (
                  <>
                    <polyline
                      fill="url(#chartGradient)"
                      stroke="none"
                      points={`50,250 ${chartData.datasets[0].data.map((value, index) => {
                        const x = 50 + (index / (chartData.datasets[0].data.length - 1)) * 700;
                        const maxVal = Math.max(...chartData.datasets[0].data);
                        const minVal = Math.min(...chartData.datasets[0].data);
                        const range = maxVal - minVal || 1;
                        const y = 250 - ((value - minVal) / range) * 200;
                        return `${x},${y}`;
                      }).join(' ')} 750,250`}
                    />
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      points={chartData.datasets[0].data.map((value, index) => {
                        const x = 50 + (index / (chartData.datasets[0].data.length - 1)) * 700;
                        const maxVal = Math.max(...chartData.datasets[0].data);
                        const minVal = Math.min(...chartData.datasets[0].data);
                        const range = maxVal - minVal || 1;
                        const y = 250 - ((value - minVal) / range) * 200;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </>
                )}
                
                {/* Y-axis labels */}
                {stats && [stats.max, (stats.max + stats.min) / 2, stats.min].map((value, index) => (
                  <text
                    key={`y-label-${index}`}
                    x="45"
                    y={55 + index * 100}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {value.toFixed(1)}
                  </text>
                ))}
                
                {/* X-axis labels */}
                {chartData.labels.length > 0 && [0, Math.floor(chartData.labels.length / 2), chartData.labels.length - 1].map(index => (
                  <text
                    key={`x-label-${index}`}
                    x={50 + (index / (chartData.labels.length - 1)) * 700}
                    y="270"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {chartData.labels[index]}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
            <h3>No Data Available</h3>
            <p>Select a parameter and date range to view historical data</p>
          </div>
        )}
      </div>

      {historicalData.length > 0 && (
        <div className="data-table-section">
          <h3>Data Table</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.slice(-50).reverse().map((point, index) => {
                  const paramInfo = parameters.find(p => p.name === selectedParameter);
                  return (
                    <tr key={index}>
                      <td>{new Date(point.timestamp).toLocaleString()}</td>
                      <td>{point.value.toFixed(2)}</td>
                      <td>{paramInfo?.unit || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {historicalData.length > 50 && (
            <p className="table-note">Showing latest 50 entries of {historicalData.length} total</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoricalData;