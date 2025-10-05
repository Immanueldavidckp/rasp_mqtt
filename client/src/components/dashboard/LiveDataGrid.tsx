import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import './LiveDataGrid.css';

const LiveDataGrid: React.FC = () => {
  const { parameters } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(parameters.map(p => p.category)));
    return ['all', ...cats];
  }, [parameters]);

  // Filter and sort parameters
  const filteredParameters = useMemo(() => {
    let filtered = parameters.filter(param => {
      const matchesSearch = param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           param.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || param.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort parameters
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'value':
          aValue = typeof a.value === 'number' ? a.value : parseFloat(a.value.toString()) || 0;
          bValue = typeof b.value === 'number' ? b.value : parseFloat(b.value.toString()) || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [parameters, searchTerm, selectedCategory, sortBy, sortOrder]);

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'ok':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'critical':
      case 'error':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  const formatValue = (value: any, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const handleSort = (field: 'name' | 'value' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="live-data-grid">
      <div className="grid-header">
        <h2>Live Data Parameters</h2>
        <div className="grid-stats">
          <span className="total-count">{filteredParameters.length} parameters</span>
          <span className="update-indicator">
            <div className="pulse-dot"></div>
            Live
          </span>
        </div>
      </div>

      <div className="grid-controls">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th 
                className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Parameter Name
                {sortBy === 'name' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Category</th>
              <th 
                className={`sortable ${sortBy === 'value' ? 'active' : ''}`}
                onClick={() => handleSort('value')}
              >
                Value
                {sortBy === 'value' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className={`sortable ${sortBy === 'status' ? 'active' : ''}`}
                onClick={() => handleSort('status')}
              >
                Status
                {sortBy === 'status' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredParameters.map((param) => (
              <tr key={param.id} className={`param-row ${param.status.toLowerCase()}`}>
                <td className="param-name">
                  <div className="name-cell">
                    <span className="name">{param.name}</span>
                    {param.description && (
                      <span className="description">{param.description}</span>
                    )}
                  </div>
                </td>
                <td className="param-category">
                  <span className="category-badge">{param.category}</span>
                </td>
                <td className="param-value">
                  <span className="value">{formatValue(param.value, param.unit)}</span>
                  {param.minValue !== undefined && param.maxValue !== undefined && (
                    <div className="value-range">
                      Range: {param.minValue} - {param.maxValue}
                    </div>
                  )}
                </td>
                <td className="param-status">
                  <div 
                    className="status-badge"
                    style={{ color: getStatusColor(param.status) }}
                  >
                    {getStatusIcon(param.status)}
                    <span>{param.status}</span>
                  </div>
                </td>
                <td className="param-timestamp">
                  {new Date(param.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredParameters.length === 0 && (
          <div className="no-data">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No parameters found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDataGrid;