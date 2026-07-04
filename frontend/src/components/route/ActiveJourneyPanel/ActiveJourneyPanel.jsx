import React, { useMemo, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, Activity, MapPin } from 'lucide-react';
import useRouteStore from '../../../stores/routeStore';
import useUiStore from '../../../stores/uiStore';
import useAlertStore from '../../../stores/alertStore';
import useNavigationStore from '../../../stores/navigationStore';
import useSafetyStore from '../../../stores/safetyStore';
import useMapStore from '../../../stores/mapStore';
import { APP_MODES, SHEET_STATES } from '../../../constants/appConstants';
import { formatDistance, formatDuration } from '../../../utils/formatters';
import { rankSafePointsForRoute } from '../../../utils/safePointRanking';
import './ActiveJourneyPanel.css';

const ActiveJourneyPanel = () => {
  const routes = useRouteStore((s) => s.routes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const destination = useRouteStore((s) => s.destination);
  const clearRoute = useRouteStore((s) => s.clearRoute);
  
  const setAppMode = useUiStore((s) => s.setAppMode);
  const setBottomSheet = useUiStore((s) => s.setBottomSheet);
  
  const isAlertModeActive = useAlertStore((s) => s.isAlertModeActive);
  const isModalVisible = useAlertStore((s) => s.isModalVisible);
  const setAlertMode = useAlertStore((s) => s.setAlertMode);
  const hideModal = useAlertStore((s) => s.hideModal);
  
  const stopNavigation = useNavigationStore((s) => s.stopNavigation);
  const remainingDistance = useNavigationStore((s) => s.remainingDistance);
  const remainingTime = useNavigationStore((s) => s.remainingTime);
  const hasDeviated = useNavigationStore((s) => s.hasDeviated);

  const safePoints = useSafetyStore((s) => s.safePoints);
  const userPosition = useNavigationStore((s) => s.userPosition);
  const flyTo = useMapStore((s) => s.flyTo);

  const [showSafePtFlash, setShowSafePtFlash] = useState(false);

  const activeRoute = routes[activeRouteIndex];

  if (!activeRoute) return null;

  // Active route geometry for corridor-aware safe point selection
  const routeGeometry = activeRoute?.geometry ?? null;

  // Route-aware nearest safe point (shared utility — same logic as SafePointSuggestions)
  const nearestSafePoint = useMemo(
    () => rankSafePointsForRoute(safePoints, routeGeometry, userPosition, 1)[0] ?? null,
    [safePoints, routeGeometry, userPosition]
  );

  // Derive distance and time. Fallback to route total if navigationStore hasn't updated yet.
  const displayDistance = remainingDistance || activeRoute.distance;
  const displayTime = remainingTime || activeRoute.duration;

  // Exact safety logic from RouteCards.jsx
  const isSafe = activeRoute.safetyScore >= 80;
  const isWarning = activeRoute.safetyScore >= 60 && activeRoute.safetyScore < 80;
  
  const getSafetyStatus = () => {
    if (isSafe) return { text: 'Safe Route', icon: ShieldCheck, className: 'status-safe' };
    if (isWarning) return { text: 'Caution', icon: Shield, className: 'status-caution' };
    return { text: 'High Risk', icon: ShieldAlert, className: 'status-danger' };
  };

  const safetyStatus = getSafetyStatus();
  const StatusIcon = safetyStatus.icon;

  const handleEndJourney = () => {
    setAppMode(APP_MODES.IDLE);
    setBottomSheet(SHEET_STATES.PEEK);
    clearRoute();
    stopNavigation();
    setAlertMode(false);
    hideModal();
  };

  return (
    <div className="active-journey-panel">
      
      {/* ── Top Status Row ── */}
      <div className="journey-top-row">
        <div className="journey-title-wrap">
          <div className="journey-pulsing-dot" />
          <h2 className="journey-title">Journey Active</h2>
        </div>
        
        <div className="journey-status-badges">
          {/* Deviation badge: use navigationStore.hasDeviated OR alertStore modal as fallback */}
          {(hasDeviated || isModalVisible) ? (
            <div className="journey-status-pill status-deviated">
              <AlertTriangle size={14} />
              <span>Deviated</span>
            </div>
          ) : (
            <div className={`journey-status-pill ${safetyStatus.className}`}>
              <StatusIcon size={14} />
              <span>{safetyStatus.text}</span>
            </div>
          )}

          {isAlertModeActive && !isModalVisible && (
            <div className="journey-status-pill status-alert-mode">
              <Activity size={14} />
              <span>Alert ON</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Destination & Inline Metrics ── */}
      <div className="journey-dest-wrap">
        <h3 className="journey-dest-name">{destination?.name || 'Destination'}</h3>
        <p className="journey-dest-subtitle">{destination?.subtitle || 'Navigating to destination'}</p>
        
        <div className="journey-metrics-inline">
          <span className="journey-metric-text">{formatDistance(displayDistance)}</span>
          <span className="journey-metric-dot">•</span>
          <span className="journey-metric-text">{formatDuration(displayTime)}</span>
        </div>
      </div>

      <div className="journey-divider" />

      {/* ── Find Nearest Safe Point ── */}
      {nearestSafePoint && (
        <button
          className="journey-safepoint-btn"
          onClick={() => {
            flyTo([nearestSafePoint.lat, nearestSafePoint.lng], 16);
            setShowSafePtFlash(true);
            setTimeout(() => setShowSafePtFlash(false), 2000);
          }}
          aria-label="Fly to nearest safe point on map"
        >
          <MapPin size={14} />
          {showSafePtFlash ? 'Showing on map…' : 'Find Nearby Safe Point'}
        </button>
      )}

      {/* ── End Journey ── */}
      <button className="journey-end-btn" onClick={handleEndJourney}>
        End Journey
      </button>

    </div>
  );
};

export default ActiveJourneyPanel;
