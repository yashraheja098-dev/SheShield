import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import useMapStore        from '../../../stores/mapStore';
import useNavigationStore from '../../../stores/navigationStore';
import { ACTIVE_TILE, DEFAULT_CENTER, DEFAULT_ZOOM, NAVIGATION_ZOOM } from '../../../constants/mapConstants';
import UserLocationPin from '../UserLocationPin/UserLocationPin';
import RouteLayer from '../RouteLayer/RouteLayer';
import HeatmapLayer from '../HeatmapLayer/HeatmapLayer';
import SafePointsLayer from '../SafePointsLayer/SafePointsLayer';
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

  const hasCentered = useRef(false);

  /* Fly to user position once on first resolve */
  useEffect(() => {
    if (userPosition && !hasCentered.current) {
      map.flyTo(userPosition, NAVIGATION_ZOOM, { animate: true, duration: 1.4 });
      hasCentered.current = true;
    }
  }, [userPosition, map]);

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

        <HeatmapLayer />
        
        <RouteLayer />
        
        <SafePointsLayer />

        <UserLocationPin position={userPosition} />
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
