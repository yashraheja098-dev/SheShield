/**
 * App — Root component.
 * Sets up routing for Splash, Login, Location Permission, and the multi-page AppShell.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

import SplashScreen            from './components/screens/SplashScreen/SplashScreen';
import LoginScreen             from './components/screens/LoginScreen/LoginScreen';
import LocationPermissionScreen from './components/screens/LocationPermissionScreen/LocationPermissionScreen';
import ProtectedRoute          from './components/layout/ProtectedRoute/ProtectedRoute';
import ErrorBoundary           from './components/ErrorBoundary';

/* ── App Shell + BottomNavBar layout ── */
import AppShell from './components/layout/AppShell/AppShell';

/* ── Pages ── */
import NavigationPage from './pages/NavigationPage';
import HomePage       from './pages/HomePage';
import SafetyHubPage  from './pages/SafetyHubPage';
import CommunityPage  from './pages/CommunityPage';
import ProfilePage    from './pages/ProfilePage';

function App() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places', 'visualization', 'marker']}>
      <BrowserRouter>
        <Routes>
          {/* ── Pre-app screens ── */}
          <Route path="/"         element={<SplashScreen />} />
          <Route path="/login"    element={<LoginScreen />} />
          <Route path="/location" element={<ProtectedRoute><LocationPermissionScreen /></ProtectedRoute>} />

          {/* ── Legacy route: redirect /map → /app/navigation ── */}
          <Route path="/map" element={<Navigate to="/app/navigation" replace />} />

          {/* ── Main application — nested under AppShell ── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AppShell />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            {/* Default: go to navigation */}
            <Route index element={<Navigate to="navigation" replace />} />

            <Route path="navigation" element={<NavigationPage />} />
            <Route path="home"       element={<HomePage />} />
            <Route path="safety"     element={<SafetyHubPage />} />
            <Route path="community"  element={<CommunityPage />} />
            <Route path="profile"    element={<ProfilePage />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;

