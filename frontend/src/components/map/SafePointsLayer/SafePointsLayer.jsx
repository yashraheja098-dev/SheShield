import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Shield, Navigation } from 'lucide-react';
import useSafetyStore from '../../../stores/safetyStore';
import useRouteStore from '../../../stores/routeStore';
import useNavigationStore from '../../../stores/navigationStore';
import useUiStore from '../../../stores/uiStore';
import { APP_MODES, SHEET_STATES } from '../../../constants/appConstants';
import './SafePointsLayer.css';

// SVG Icons for different safe points
const icons = {
  police: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  metro: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><path d="M9 16v-6l3 3 3-3v6"/></svg>`,
  pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/><path d="M16 22H8"/></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
};

const SafePointsLayer = () => {
  const map = useMap();
  const safePoints = useSafetyStore((s) => s.safePoints);
  const isSafePointsVisible = useSafetyStore((s) => s.isSafePointsVisible);
  const activeFilter = useSafetyStore((s) => s.activeFilter);

  const setDestination = useRouteStore((s) => s.setDestination);
  const setOrigin = useRouteStore((s) => s.setOrigin);
  const userPosition = useNavigationStore((s) => s.userPosition);
  const setAppMode = useUiStore((s) => s.setAppMode);
  const setBottomSheet = useUiStore((s) => s.setBottomSheet);
  
  const [activePopupId, setActivePopupId] = useState(null);

  const filteredPoints = useMemo(() => {
    if (!activeFilter) return safePoints;
    return safePoints.filter(p => p.type === activeFilter);
  }, [safePoints, activeFilter]);

  const handleNavigate = useCallback(async (point) => {
    setActivePopupId(null); // Close popup

    if (!userPosition || userPosition.length !== 2) {
      console.error('Routing cannot start: Valid userPosition is missing.');
      return;
    }

    const destLat = parseFloat(point.lat);
    const destLng = parseFloat(point.lng);

    if (!Number.isFinite(destLat) || !Number.isFinite(destLng)) {
      console.error('Routing cannot start: Invalid Safe Point coordinates.');
      return;
    }

    // Set origin and destination visually
    const originObj = { lat: userPosition[0], lng: userPosition[1], name: 'My Location' };
    const destObj = {
      id: String(point.id),
      name: String(point.name || 'Safe Point'),
      subtitle: String(point.address || point.subtitle || 'Safe Point Location'),
      lat: destLat,
      lng: destLng,
      type: point.type || 'place'
    };

    setOrigin(originObj);
    setDestination(destObj);

    // Show loading indicator implicitly by moving to NAVIGATING mode
    // The route store will handle loading state if needed
    useUiStore.getState().setAppMode(APP_MODES.NAVIGATING);
    setBottomSheet(SHEET_STATES.HIDDEN);

    try {
      useUiStore.getState().pushToast({ type: 'info', message: 'Calculating fastest safe route...' });
      
      const { routingApi } = await import('../../../services/api/routingApi');
      const axiosInstance = (await import('../../../services/api/axiosInstance')).default;
      
      const fetchedRoutes = await routingApi.getSafeRoutes(originObj, destObj);
      
      if (fetchedRoutes && fetchedRoutes.length > 0) {
        // Assume first is best for safe point
        const activeRoute = fetchedRoutes[0];
        
        useRouteStore.getState().setRoutes(fetchedRoutes);
        useRouteStore.getState().setActiveRouteIndex(0);
        useRouteStore.getState().setActiveRoute(activeRoute);

        // Start Journey on backend silently
        try {
          const res = await axiosInstance.post('/journey/start', {
            origin:      originObj.name,
            destination: destObj.name,
            selectedRoute: {
              distance:    activeRoute.distance,
              duration:    String(activeRoute.duration) + 's',
              polyline:    activeRoute.polyline || 'frontend_simulated_polyline',
              safetyScore: activeRoute.safetyScore,
              riskLevel:   activeRoute.riskLevel || 'Unknown',
              coordinates: activeRoute.geometry || [],
            },
          });
          if (res.data?.journey?._id) {
            useNavigationStore.getState().setActiveJourneyId(res.data.journey._id);
          }
        } catch (journeyErr) {
          console.error('Journey start logging failed:', journeyErr);
        }
      } else {
        throw new Error('No routes found.');
      }
    } catch (err) {
      console.error('Failed to auto-fetch route to safe point:', err);
      useUiStore.getState().pushToast({ type: 'error', message: 'Failed to calculate route.' });
      setAppMode(APP_MODES.IDLE);
    }
  }, [userPosition, setOrigin, setDestination, setAppMode, setBottomSheet]);


  if (!isSafePointsVisible || !filteredPoints || filteredPoints.length === 0) return null;

  return (
    <>
      {filteredPoints.map((point) => (
        <React.Fragment key={point.id}>
          <AdvancedMarker
            position={{ lat: point.lat, lng: point.lng }}
            onClick={() => {
              setActivePopupId(point.id);
              // Hide bottom sheet when a Safe Point popup is active
              const currentSheetState = useUiStore.getState().bottomSheetState;
              if (currentSheetState !== SHEET_STATES.HIDDEN) {
                setBottomSheet(SHEET_STATES.HIDDEN);
              }
            }}
          >
            <div 
              className={`safe-point-marker marker-${point.type} custom-safe-point-icon`} 
              dangerouslySetInnerHTML={{ __html: icons[point.type] || icons.default }}
            />
          </AdvancedMarker>

          {activePopupId === point.id && (
            <InfoWindow
              position={{ lat: point.lat, lng: point.lng }}
              onCloseClick={() => setActivePopupId(null)}
              pixelOffset={[0, -25]}
              className="safe-point-popup"
              headerDisabled={true}
            >
              <div className="safe-point-popup-content">
                <h3>{point.name}</h3>
                <div className="sp-header-row">
                  <p className="sp-type">{point.type.replace('_', ' ').toUpperCase()}</p>
                  {point.isOpen24h && <span className="sp-badge-24h">24/7 Open</span>}
                </div>
                <p className="sp-distance">{point.distance}m away</p>
                {point.address && <p className="sp-address">{point.address}</p>}

                <button
                  className="sp-navigate-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigate(point);
                  }}
                  type="button"
                >
                  <Navigation size={14} />
                  Start Navigation
                </button>
              </div>
            </InfoWindow>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default SafePointsLayer;
