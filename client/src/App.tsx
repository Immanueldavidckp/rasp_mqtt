import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SocketProvider } from './contexts/SocketContext';
import { DataProvider } from './contexts/DataContext';
import Dashboard from './pages/Dashboard';
import VehicleDetails from './pages/VehicleDetails';
import HistoricalData from './pages/HistoricalData';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <DataProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vehicle" element={<VehicleDetails />} />
                <Route path="/historical" element={<HistoricalData />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </DataProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
