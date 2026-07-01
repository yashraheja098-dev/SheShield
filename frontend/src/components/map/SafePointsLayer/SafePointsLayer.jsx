import { useMemo, useCallback } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Shield, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
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

const createCustomIcon = (type) => {
  const svgString = icons[type] || icons.default;
  return L.divIcon({
    html: `<div class="safe-point-marker marker-${type}">${svgString}</div>`,
    className: 'custom-safe-point-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
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

  const filteredPoints = useMemo(() => {
    if (!activeFilter) return safePoints;
    return safePoints.filter(p => p.type === activeFilter);
  }, [safePoints, activeFilter]);

  const handleNavigate = useCallback((point) => {
    map.closePopup();

    // Set origin to current user position
    if (userPosition) {
      setOrigin({
        lat: userPosition[0],
        lng: userPosition[1],
        name: 'My Location'
      });
    }

    setDestination({
      id: point.id,
      name: point.name,
      subtitle: point.address,
      lat: point.lat,
      lng: point.lng,
      type: 'safepoint'
    });

    setAppMode(APP_MODES.PLANNING);
    setBottomSheet(SHEET_STATES.HALF);
  }, [map, userPosition, setOrigin, setDestination, setAppMode, setBottomSheet]);

  if (!isSafePointsVisible || !filteredPoints || filteredPoints.length === 0) return null;

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={40}
      showCoverageOnHover={false}
      spiderfyOnMaxZoom={true}
    >
      {filteredPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createCustomIcon(point.type)}
          eventHandlers={{
            popupopen: (e) => {
              // Record exactly when the popup was opened natively by Leaflet
              e.popup._lastOpenTime = Date.now();
            },
            click: (e) => {
              const marker = e.target;
              const popup = marker.getPopup();
              if (popup && popup.isOpen()) {
                // Leaflet naturally opens the popup on marker click before firing this click event.
                // We compare the current time with the open time.
                // If it opened just a few milliseconds ago, this click was to OPEN it.
                // If it opened long ago (> 200ms), this click was to CLOSE (toggle) it.
                const wasJustOpened = (Date.now() - (popup._lastOpenTime || 0)) < 200;
                if (!wasJustOpened) {
                  marker.closePopup();
                }
              }
            }
          }}
        >
          <Popup 
            className="safe-point-popup"
            autoPanPadding={[50, 50]}
            closeButton={true}
          >
            <div className="safe-point-popup-content">
              <h3>{point.name}</h3>
              <p className="sp-type">{point.type.replace('_', ' ').toUpperCase()}</p>
              <p className="sp-distance">{point.distance}m away</p>

              <button
                className="sp-navigate-btn"
                onPointerUp={(e) => {
                  e.stopPropagation();
                  handleNavigate(point);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    handleNavigate(point);
                  }
                }}
              >
                <Navigation size={14} />
                Start Navigation
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

export default SafePointsLayer;
