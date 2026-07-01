/**
 * MapContainer — Leaflet map with dark tiles.
 *
 * Architecture note:
 *   - MapController (inner component) must be a *child* of LeafletMapContainer
 *     to access the useMap() hook.
 *   - MapController stores the map instance in Zustand so other components
 *     (SOS button, search bar) can trigger flyTo() without prop drilling.
 *   - userPosition comes from navigationStore — set once by MapShell on
 *     geolocation resolve.
 */
import { useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import useMapStore        from '../../../stores/mapStore';
import useNavigationStore from '../../../stores/navigationStore';
import { ACTIVE_TILE, DEFAULT_CENTER, DEFAULT_ZOOM, NAVIGATION_ZOOM } from '../../../constants/mapConstants';
import UserLocationPin from '../UserLocationPin/UserLocationPin';
import './MapContainer.css';

/* ── Inner: registers the map instance in Zustand ── */
const MapController = () => {
  const map            = useMap();
  const setMapInstance = useMapStore((s) => s.setMapInstance);
  const userPosition   = useNavigationStore((s) => s.userPosition);

  /* Register map instance on mount */
  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map, setMapInstance]);

  /* Fly to user position once on first resolve */
  useEffect(() => {
    if (userPosition) {
      map.flyTo(userPosition, NAVIGATION_ZOOM, { animate: true, duration: 1.4 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentional: only run once on first mount with position

  return null;
};

/* ── Outer: the Leaflet map shell ── */
const MapContainer = () => {
  const userPosition = useNavigationStore((s) => s.userPosition);

  return (
    <div className="she-map-container">
      <LeafletMapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        attributionControl={true}
        className="she-map-canvas"
        preferCanvas={true}   /* better performance for many markers */
      >
        <TileLayer
          url={ACTIVE_TILE.url}
          attribution={ACTIVE_TILE.attribution}
          maxZoom={ACTIVE_TILE.maxZoom}
          subdomains={ACTIVE_TILE.subdomains}
        />

        <MapController />

        {/* Phase 2: RouteLayer goes here */}
        {/* Phase 3: HeatMapLayer, SafePointMarkers go here */}

        <UserLocationPin position={userPosition} />
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
