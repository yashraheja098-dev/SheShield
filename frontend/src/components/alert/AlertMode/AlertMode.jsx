import React, { useEffect } from 'react';
import { ShieldAlert, Shield } from 'lucide-react';
import useAlertStore from '../../../stores/alertStore';
import useUiStore from '../../../stores/uiStore';
import useNavigationStore from '../../../stores/navigationStore';
import useRouteStore from '../../../stores/routeStore';
import { APP_MODES } from '../../../constants/appConstants';
import { closestPointOnRoute } from '../../../utils/geoUtils';
import './AlertMode.css';

const DEVIATION_THRESHOLD_METERS = 250;

const AlertMode = () => {
  const appMode = useUiStore((s) => s.appMode);
  const userPosition = useNavigationStore((s) => s.userPosition);
  
  // Use specific selectors for route store to prevent excessive re-renders
  const routes = useRouteStore((s) => s.routes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  
  const isAlertModeActive = useAlertStore((s) => s.isAlertModeActive);
  const toggleAlertMode = useAlertStore((s) => s.toggleAlertMode);
  const showModal = useAlertStore((s) => s.showModal);
  const isModalVisible = useAlertStore((s) => s.isModalVisible);

  // Monitor position for deviation
  useEffect(() => {
    if (!isAlertModeActive || appMode !== APP_MODES.NAVIGATING || isModalVisible || !userPosition) return;
    
    const currentRoute = routes[activeRouteIndex];
    if (!currentRoute || !currentRoute.coordinates) return;

    // Use geoUtils to find distance
    const { distance } = closestPointOnRoute(userPosition, currentRoute.coordinates);
    
    if (distance > DEVIATION_THRESHOLD_METERS) {
      showModal();
    }
  }, [userPosition, isAlertModeActive, appMode, isModalVisible, routes, activeRouteIndex, showModal]);

  // Bind simulateDeviation for hackathon demo (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.simulateDeviation = () => {
        if (appMode === APP_MODES.NAVIGATING) {
          showModal();
          console.log("Simulated deviation triggered.");
        } else {
          console.warn("simulateDeviation: App must be in NAVIGATING mode.");
        }
      };
    }
    
    return () => {
      if (import.meta.env.DEV) {
        delete window.simulateDeviation;
      }
    };
  }, [appMode, showModal]);

  // Alert Mode UI only exists during navigation
  if (appMode !== APP_MODES.NAVIGATING) {
    return null;
  }

  return (
    <button 
      className={`alert-mode-pill ${isAlertModeActive ? 'active' : ''}`}
      onClick={toggleAlertMode}
      aria-label="Toggle Alert Mode"
      aria-pressed={isAlertModeActive}
    >
      <span className="alert-mode-icon" aria-hidden="true">
        {isAlertModeActive ? '🟢' : '🛡'}
      </span>
      {isAlertModeActive ? 'Alert Mode Active' : 'Alert Mode'}
    </button>
  );
};

export default AlertMode;
