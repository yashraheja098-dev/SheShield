import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import useRouteStore from '../../../stores/routeStore';
import useUiStore from '../../../stores/uiStore';
import { APP_MODES } from '../../../constants/appConstants';
import { routingApi } from '../../../services/api/routingApi';
import './RouteLayer.css';

const GooglePolyline = ({ positions, pathOptions, eventHandlers }) => {
  const map = useMap();
  const polylineRef = useRef(null);

  // 1. Create polyline instance once
  useEffect(() => {
    if (!polylineRef.current && window.google) {
      polylineRef.current = new window.google.maps.Polyline();
    }
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        window.google.maps.event.clearInstanceListeners(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, []);

  // 2. Attach to map
  useEffect(() => {
    if (!polylineRef.current || !map) return;
    polylineRef.current.setMap(map);
  }, [map]);

  // 3. Update options
  useEffect(() => {
    if (!polylineRef.current) return;
    
    const options = {
      path: positions.map(p => ({ lat: p[0], lng: p[1] })),
      strokeColor: pathOptions.color,
      strokeOpacity: pathOptions.opacity,
      strokeWeight: pathOptions.weight,
      clickable: !!eventHandlers?.click,
      zIndex: pathOptions.zIndex !== undefined ? pathOptions.zIndex : pathOptions.weight
    };
    
    polylineRef.current.setOptions(options);
    
    // Manage click listener
    if (eventHandlers?.click) {
      const listener = polylineRef.current.addListener('click', eventHandlers.click);
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [positions, pathOptions, eventHandlers]);

  return null;
};

const RouteLayer = () => {
  const map = useMap();
  const origin = useRouteStore((s) => s.origin);
  const destination = useRouteStore((s) => s.destination);
  const routes = useRouteStore((s) => s.routes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const activeRoutePersistent = useRouteStore((s) => s.activeRoute);
  
  const setRoutes = useRouteStore((s) => s.setRoutes);
  const setLoading = useRouteStore((s) => s.setLoading);
  const setError = useRouteStore((s) => s.setError);
  const setActiveRouteIndex = useRouteStore((s) => s.setActiveRouteIndex);
  
  const pushToast = useUiStore((s) => s.pushToast);
  const appMode = useUiStore((s) => s.appMode);

  // Fetch routes when origin and destination change
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!origin || !destination) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const fetchedRoutes = await routingApi.getSafeRoutes(origin, destination);
        setRoutes(fetchedRoutes);
        
        if (fetchedRoutes.length > 0 && fetchedRoutes[0].isMock) {
          pushToast({ 
            type: 'info', 
            message: 'Development Mode: Displaying simulated route geometries.' 
          });
        }
      } catch (err) {
        console.error('RouteLayer: Routing failed for origin/destination.', { origin, destination, error: err.message });
        setRoutes([]);
        setError(err.message || 'Failed to find route');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutes();
  }, [origin, destination, setRoutes, setLoading, setError]);

  // Fit map bounds to active route in PLANNING mode, or follow user in NAVIGATING mode
  useEffect(() => {
    if (!map) return;

    if (appMode === APP_MODES.NAVIGATING) {
      // In navigating mode, do not fit bounds to the whole route.
      // Instead, zoom in to the user's current location to start the journey!
      const userPos = useNavigationStore.getState().userPosition;
      if (userPos && userPos.length === 2) {
        map.panTo({ lat: userPos[0], lng: userPos[1] });
        map.setZoom(17); // NAVIGATION_ZOOM equivalent
      }
      return;
    }

    if (appMode === APP_MODES.PLANNING) {
      const activeRoute = routes[activeRouteIndex];
      if (activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        activeRoute.geometry.forEach(p => {
          if (Number.isFinite(p[0]) && Number.isFinite(p[1])) {
            bounds.extend({ lat: p[0], lng: p[1] });
          }
        });
        
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: { top: 100, right: 20, bottom: 300, left: 20 }
          });
        }
      }
    }
  }, [routes, activeRouteIndex, map, appMode]);

  const getRouteColor = (route) => {
    if (route.type === 'safe') return '#00e676'; // Emerald Green
    if (route.type === 'fast') return '#ff2d95'; // Vibrant Magenta
    return '#00b0ff'; // Cyan/Blue
  };

  const isNavigating = appMode === APP_MODES.NAVIGATING;
  const currentActiveRoute = isNavigating ? activeRoutePersistent : routes[activeRouteIndex];

  if (!isNavigating && (!routes || routes.length === 0)) return null;
  if (isNavigating && !currentActiveRoute) return null;

  return (
    <>
      {!isNavigating && routes.map((route, index) => {
        if (index === activeRouteIndex) return null; // Skip active route for now
        
        return (
          <React.Fragment key={`inactive_group_${route.id}`}>
            {/* Inactive Route Outline (Shadow) */}
            <GooglePolyline
              positions={route.geometry}
              eventHandlers={{ click: () => setActiveRouteIndex(index) }}
              pathOptions={{
                color: '#1a1a2e',
                weight: 6,
                opacity: 0.5,
                zIndex: 10
              }}
            />
            {/* Inactive Route Inner */}
            <GooglePolyline
              positions={route.geometry}
              eventHandlers={{ click: () => setActiveRouteIndex(index) }}
              pathOptions={{
                color: getRouteColor(route),
                weight: 4,
                opacity: 0.6,
                zIndex: 11
              }}
            />
          </React.Fragment>
        );
      })}
      
      {/* Active Route */}
      {currentActiveRoute && (
        <React.Fragment key={`active_group_${currentActiveRoute.id}`}>
          {/* Active Route Outline (Shadow) */}
          <GooglePolyline
            positions={currentActiveRoute.geometry}
            pathOptions={{
              color: '#0f0f1a',
              weight: 8,
              opacity: 0.9,
              zIndex: 100
            }}
          />
          {/* Active Route Core */}
          <GooglePolyline
            positions={currentActiveRoute.geometry}
            pathOptions={{
              color: getRouteColor(currentActiveRoute),
              weight: 6,
              opacity: 1,
              zIndex: 101
            }}
          />
        </React.Fragment>
      )}
    </>
  );
};

export default RouteLayer;
