import { useState } from 'react';
import { formatDistance, formatDuration } from '../../../utils/formatters';
import useRouteStore from '../../../stores/routeStore';
import useUiStore from '../../../stores/uiStore';
import useNavigationStore from '../../../stores/navigationStore';
import { APP_MODES, SHEET_STATES } from '../../../constants/appConstants';
import { ShieldAlert, ShieldCheck, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../../services/api/axiosInstance';
import './RouteCards.css';

const RouteCard = ({ route, isActive, isExpanded, onToggleExpand, onClick, onStartNavigation }) => {
  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);

  const isSafe = route.safetyScore >= 80;
  const isWarning = route.safetyScore >= 60 && route.safetyScore < 80;
  
  const scoreClass = isSafe ? 'score-safe' : (isWarning ? 'score-warning' : 'score-danger');
  const Icon = isSafe ? ShieldCheck : (isWarning ? Shield : ShieldAlert);

  return (
    <div 
      className={`route-card ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* COMPACT SUMMARY ROW */}
      <div className="route-card-header">
        <div className="route-card-title">
          <span className="route-card-label">{route.label}</span>
          <div className="route-card-metrics">
            <span className="route-card-time-compact">{formatDuration(route.duration)}</span>
            <span className="route-card-dot">•</span>
            <span className="route-card-subtitle">{formatDistance(route.distance)}</span>
          </div>
        </div>
        
        <div className="route-card-actions">
          <div className={`route-card-mini-score ${scoreClass}`}>
            <Icon size={14} />
            <span>{route.safetyScore}</span>
          </div>
          <button 
            className="route-card-chevron" 
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Collapse route details" : "Expand route details"}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {isExpanded && (
        <div className="route-card-expanded-content">
          <div className={`route-card-safety-container ${scoreClass}`}>
            <div className="route-card-safety-header">
              <div className="route-card-score-badge">
                <Icon size={16} />
                <span>{route.safetyScore}/100 Safety</span>
                <span className="route-card-risk">({route.riskLevel || 'Unknown'})</span>
              </div>
              {route.warnings && route.warnings.length > 0 && (
                <button className="route-card-expand-btn" onClick={(e) => {
                  e.stopPropagation();
                  setIsSafetyExpanded(!isSafetyExpanded);
                }}>
                  <span>{isSafetyExpanded ? 'Hide' : 'Why this score?'}</span>
                  {isSafetyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
            {isSafetyExpanded && route.warnings && route.warnings.length > 0 && (
              <div className="route-card-safety-details">
                <ul className="route-card-warnings">
                  {route.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
          
          {isActive && (
            <button 
              className="route-start-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onStartNavigation) onStartNavigation();
              }}
            >
              Start Navigation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const RouteCards = () => {
  const routes = useRouteStore((s) => s.routes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const setActiveRoute = useRouteStore((s) => s.setActiveRoute);
  const isLoading = useRouteStore((s) => s.isLoading);
  const error = useRouteStore((s) => s.error);
  const origin = useRouteStore((s) => s.origin);
  const destination = useRouteStore((s) => s.destination);

  const setAppMode = useUiStore((s) => s.setAppMode);
  const setBottomSheet = useUiStore((s) => s.setBottomSheet);

  const [expandedIndex, setExpandedIndex] = useState(0);

  const setActiveJourneyId = useNavigationStore((s) => s.setActiveJourneyId);

  const handleStartNavigation = async () => {
    const activeRoute = routes[activeRouteIndex];
    // Switch UI to navigating immediately so the user isn’t blocked
    setAppMode(APP_MODES.NAVIGATING);
    setBottomSheet(SHEET_STATES.HIDDEN);

    // Fire-and-forget journey start; store the journey id for later use (end / SOS)
    try {
      const res = await axiosInstance.post('/journey/start', {
        origin:      origin?.name || 'Current Location',
        destination: destination?.name || 'Destination',
        selectedRoute: {
          distance:    activeRoute.distance,
          duration:    String(activeRoute.duration) + 's',
          polyline:    activeRoute.polyline || 'frontend_simulated_polyline',
          safetyScore: activeRoute.safetyScore,
          riskLevel:   activeRoute.riskLevel || 'Unknown',
          coordinates: activeRoute.geometry || [],
        },
      });
      const journeyId = res.data?.journey?._id;
      if (journeyId) setActiveJourneyId(journeyId);
    } catch (err) {
      console.error('Journey start failed (non-blocking):', err);
    }
  };

  if (isLoading) {
    return (
      <div className="route-cards-container loading">
        <div className="route-card skeleton"></div>
        <div className="route-card skeleton"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="route-cards-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!routes || routes.length === 0) return null;

  return (
    <div className="route-cards-container">
      {routes.map((route, index) => (
        <RouteCard 
          key={route.id}
          route={route}
          isActive={index === activeRouteIndex}
          isExpanded={index === expandedIndex}
          onToggleExpand={(e) => {
            e.stopPropagation();
            setExpandedIndex(expandedIndex === index ? null : index);
          }}
          onClick={() => setActiveRoute(index)}
          onStartNavigation={handleStartNavigation}
        />
      ))}
    </div>
  );
};

export default RouteCards;
