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
import L from 'leaflet';

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
import LiveReportsFeed from '../../report/LiveReportsFeed/LiveReportsFeed';
import EmergencyContactsButton from '../../contacts/EmergencyContactsButton/EmergencyContactsButton';
import EmergencyContactsModal from '../../contacts/EmergencyContactsModal/EmergencyContactsModal';

import useGeolocation    from '../../../hooks/useGeolocation';
import useNavigationStore from '../../../stores/navigationStore';
import useSafetyStore from '../../../stores/safetyStore';
import useReportStore from '../../../stores/reportStore';
import useJourneyTracker from '../../../hooks/useJourneyTracker';
import useUiStore from '../../../stores/uiStore';
import axiosInstance from '../../../services/api/axiosInstance';
import { APP_MODES } from '../../../constants/appConstants';

import './MapShell.css';

const MapShell = () => {
  const appMode = useUiStore((s) => s.appMode);
  /* Single geolocation call for the entire app */
  const { position } = useGeolocation(appMode === APP_MODES.NAVIGATING);
  const updatePosition = useNavigationStore((s) => s.updatePosition);
  
  const setHeatMapData = useSafetyStore((s) => s.setHeatMapData);
  const setSafePoints = useSafetyStore((s) => s.setSafePoints);
  const setLoadingHeatMap = useSafetyStore((s) => s.setLoadingHeatMap);
  const setLoadingSafePoints = useSafetyStore((s) => s.setLoadingSafePoints);
  const setSafePointsError = useSafetyStore((s) => s.setSafePointsError);

  const setReports = useReportStore((s) => s.setReports);

  // Activate journey tracker hook (runs only in NAVIGATING mode)
  useJourneyTracker();

  useEffect(() => {
    if (position) {
      updatePosition([position.lat, position.lng]);
    }
  }, [position, updatePosition]);

  // Fetch real safety data from backend when position is available
  useEffect(() => {
    const fetchSafetyData = async () => {
      if (!position) return;

      setLoadingHeatMap(true);
      setLoadingSafePoints(true);

      try {
        const params = { latitude: position.lat, longitude: position.lng, radius: 5000 };

        // 1. Fetch heatmap data independently so errors here don't block other layers
        let heatmap = [];
        try {
          const heatmapRes = await axiosInstance.get('/heatmap');
          heatmap = (heatmapRes.data?.points || []).map((p) => [
            p.latitude,
            p.longitude,
            p.weight / 5,
          ]);
        } catch (heatmapError) {
          console.error('Failed to fetch heatmap data', heatmapError);
        }
        setHeatMapData(heatmap);

        // 2. Fetch other safety data
        const [pointsRes, incidentsRes] = await Promise.all([
          axiosInstance.get('/safe-points', { params }),
          axiosInstance.get('/incidents', { params }),
        ]);

        // Normalization moved out since it's already extracted above

        // Normalize safe points: backend category string → frontend type id
        const CATEGORY_TO_TYPE = {
          'Police Station':    'police',
          'Hospital':          'hospital',
          'Pharmacy':          'pharmacy',
          'Petrol Pump':       'petrol_pump',
          'Hotel':             'hotel',
          'Metro Station':     'metro',
          'Railway Station':   'railway',
          'Bus Terminal':      'bus_stand',
          'Women Help Centre': 'womens_desk',
        };
        const userLatLng = L.latLng(position.lat, position.lng);
        const points = (pointsRes.data?.safePoints || [])
          .map((p) => {
            // Fallback to GeoJSON location if latitude/longitude are missing from old DB records
            const rawLat = p.latitude ?? p.location?.coordinates?.[1];
            const rawLng = p.longitude ?? p.location?.coordinates?.[0];
            const pLat = parseFloat(rawLat);
            const pLng = parseFloat(rawLng);
            
            if (Number.isNaN(pLat) || Number.isNaN(pLng)) {
              return null; // Invalid coordinate
            }

            const distance = Math.round(userLatLng.distanceTo(L.latLng(pLat, pLng)));
            
            return {
              ...p,
              id:       p._id,
              type:     CATEGORY_TO_TYPE[p.category] || 'hotel',
              lat:      pLat,
              lng:      pLng,
              isOpen24h: p.openStatus?.toLowerCase().includes('24'),
              distance: distance
            };
          })
          .filter(Boolean); // Remove invalid points

        setSafePoints(points);

        // Normalize incidents to match the frontend reportStore shape
        const reports = (incidentsRes.data?.incidents || []).map((inc) => ({
          id:          inc._id,
          category:    inc.type,
          description: inc.description || '',
          position:    inc.latitude != null ? [inc.latitude, inc.longitude] : null,
          timestamp:   inc.createdAt,
        })).filter((r) => r.position !== null);
        setReports(reports);

      } catch (error) {
        console.error('Failed to fetch safety data', error);
        setSafePointsError('Failed to load nearby safe points. Please check your connection.');
      } finally {
        setLoadingHeatMap(false);
      }
    };

    fetchSafetyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.lat, position?.lng]); // fetch once per position change

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SearchBar />
            <EmergencyContactsButton />
          </div>
          
          {/* ── Live Reports Feed ── */}
          <LiveReportsFeed />
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
      <EmergencyContactsModal />

    </div>
  );
};

export default MapShell;
