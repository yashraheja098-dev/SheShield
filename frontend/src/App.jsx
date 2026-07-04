/**
 * App — Root component.
 * Sets up the routing for Splash Screen, Login, and the MapShell.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen/SplashScreen';
import LoginScreen from './components/screens/LoginScreen/LoginScreen';
import LocationPermissionScreen from './components/screens/LocationPermissionScreen/LocationPermissionScreen';
import MapShell from './components/layout/MapShell/MapShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry point: Splash Screen */}
        <Route path="/" element={<SplashScreen />} />
        
        {/* Authentication */}
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Location Permission Screen */}
        <Route path="/location" element={<LocationPermissionScreen />} />
        
        {/* Main Application Shell */}
        <Route path="/map" element={<MapShell />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
