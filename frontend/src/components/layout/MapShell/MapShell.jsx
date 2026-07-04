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
import MapLayerControls from '../../ui/MapLayerControls/MapLayerControls';
import AlertMode       from '../../alert/AlertMode/AlertMode';
import AlertModal      from '../../alert/AlertModal/AlertModal';
import ReportButton    from '../../report/ReportButton/ReportButton';
import ReportModal     from '../../report/ReportModal/ReportModal';

import useGeolocation    from '../../../hooks/useGeolocation';
import useNavigationStore from '../../../stores/navigationStore';
import useSafetyStore from '../../../stores/safetyStore';
import { mockApi } from '../../../mocks';

import './MapShell.css';

const MapShell = () => {
  /* Single geolocation call for the entire app */
  const { position } = useGeolocation();
  const updatePosition = useNavigationStore((s) => s.updatePosition);
  
  const timeSlot = useSafetyStore((s) => s.timeSlot);
  const setHeatMapData = useSafetyStore((s) => s.setHeatMapData);
  const setSafePoints = useSafetyStore((s) => s.setSafePoints);
  const setLoadingHeatMap = useSafetyStore((s) => s.setLoadingHeatMap);
  const setLoadingSafePoints = useSafetyStore((s) => s.setLoadingSafePoints);

  useEffect(() => {
    if (position) {
      updatePosition([position.lat, position.lng]);
    }
  }, [position, updatePosition]);

  // Fetch mock safety data when position is available
  useEffect(() => {
    const fetchSafetyData = async () => {
      if (!position) return;
      
      setLoadingHeatMap(true);
      setLoadingSafePoints(true);
      
      try {
        const [heatmap, points] = await Promise.all([
          mockApi.getHeatMapData(timeSlot.id, position.lat, position.lng),
          mockApi.getSafePoints(position.lat, position.lng, 5000)
        ]);
        
        setHeatMapData(heatmap);
        setSafePoints(points);
      } catch (error) {
        console.error('Failed to fetch safety data', error);
      } finally {
        setLoadingHeatMap(false);
        setLoadingSafePoints(false);
      }
    };
    
    fetchSafetyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, timeSlot.id]); // re-fetch if time of day changes

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
        <MapLayerControls />
        <MapControls />
      </div>

      {/* ── Layer 2.5: Alert Mode (z-index: 900) ── */}
      <div className="layer layer--alert">
        <AlertMode />
      </div>

      {/* ── Layer 2.8: Report Incident (z-index: 910) ── */}
      <div className="layer layer--report">
        <ReportButton />
      </div>

      {/* ── Layer 3: SOS FAB (z-index: 999) ── */}
      <div className="layer layer--sos">
        <SOSButton />
      </div>

      {/* ── Layer 4: Bottom sheet (z-index: 300) ── */}
      <div className="layer layer--bottom">
        <BottomSheet />
      </div>

      {/* ── Modals ── */}
      <AlertModal />
      <ReportModal />

    </div>
  );
};

export default MapShell;
