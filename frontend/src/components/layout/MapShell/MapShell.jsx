/**
 * MapShell — Root layout orchestrator.
 *
 * Responsibilities:
 *   1. Calls useGeolocation() ONCE — stores position in navigationStore.
 *      All other components read from the store, never call geolocation again.
 *   2. Positions all floating UI layers over the map using CSS.
 *   3. Remains a pure layout component — no business logic here.
 */
import { useEffect } from 'react';

import MapContainer    from '../../map/MapContainer/MapContainer';
import SearchBar       from '../../search/SearchBar/SearchBar';
import SOSButton       from '../../sos/SOSButton/SOSButton';
import BottomSheet     from '../../ui/BottomSheet/BottomSheet';
import MapControls     from '../../ui/MapControls/MapControls';

import useGeolocation    from '../../../hooks/useGeolocation';
import useNavigationStore from '../../../stores/navigationStore';

import './MapShell.css';

const MapShell = () => {
  /* Single geolocation call for the entire app */
  const { position } = useGeolocation();
  const updatePosition = useNavigationStore((s) => s.updatePosition);

  useEffect(() => {
    if (position) {
      updatePosition([position.lat, position.lng]);
    }
  }, [position, updatePosition]);

  return (
    <div className="map-shell" id="she-app-shell">

      {/* ── Layer 0: Full-screen map (z-index: 0) ── */}
      <div className="layer layer--map">
        <MapContainer />
      </div>

      {/* ── Layer 1: Top floating controls (z-index: 100) ── */}
      <div className="layer layer--top" aria-label="Search">
        <div className="top-controls-wrap">
          {/* App brand */}
          <div className="app-brand" aria-label="SheShield">
            <span className="app-brand-shield" aria-hidden="true">🛡️</span>
            <span className="app-brand-name">SheShield</span>
          </div>

          {/* Search */}
          <SearchBar />
        </div>
      </div>

      {/* ── Layer 2: Right-side map controls (z-index: 150) ── */}
      <div className="layer layer--controls" aria-label="Map controls">
        <MapControls />
      </div>

      {/* ── Layer 3: SOS FAB (z-index: 999) ── */}
      <div className="layer layer--sos">
        <SOSButton />
      </div>

      {/* ── Layer 4: Bottom sheet (z-index: 300) ── */}
      <div className="layer layer--bottom">
        <BottomSheet />
      </div>

    </div>
  );
};

export default MapShell;
