/**
 * MapControls — Custom zoom and my-location controls.
 * Replaces Leaflet's default zoom UI with premium glass buttons.
 */
import { Plus, Minus, Navigation2 } from 'lucide-react';
import useMapStore        from '../../../stores/mapStore';
import useNavigationStore from '../../../stores/navigationStore';
import { NAVIGATION_ZOOM } from '../../../constants/mapConstants';
import './MapControls.css';

const MapControls = () => {
  const mapInstance  = useMapStore((s) => s.mapInstance);
  const userPosition = useNavigationStore((s) => s.userPosition);

  const zoomIn  = () => mapInstance?.zoomIn(1);
  const zoomOut = () => mapInstance?.zoomOut(1);

  const goToMyLocation = () => {
    if (userPosition && mapInstance) {
      mapInstance.flyTo(userPosition, NAVIGATION_ZOOM, {
        animate: true,
        duration: 1.0,
      });
    }
  };

  return (
    <div className="map-controls" role="group" aria-label="Map controls">

      {/* ── My Location ── */}
      <button
        id="ctrl-my-location"
        className="map-ctrl-btn"
        onClick={goToMyLocation}
        aria-label="Go to my location"
        title="My Location"
        disabled={!userPosition}
      >
        <Navigation2 size={17} strokeWidth={2} />
      </button>

      {/* ── Zoom In ── */}
      <button
        id="ctrl-zoom-in"
        className="map-ctrl-btn"
        onClick={zoomIn}
        aria-label="Zoom in"
        title="Zoom In"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>

      {/* ── Zoom Out ── */}
      <button
        id="ctrl-zoom-out"
        className="map-ctrl-btn"
        onClick={zoomOut}
        aria-label="Zoom out"
        title="Zoom Out"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>

    </div>
  );
};

export default MapControls;
