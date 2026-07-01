import { Map, MapPin } from 'lucide-react';
import useSafetyStore from '../../../stores/safetyStore';
import './MapLayerControls.css';

const MapLayerControls = () => {
  const isHeatmapVisible = useSafetyStore((s) => s.isHeatmapVisible);
  const isSafePointsVisible = useSafetyStore((s) => s.isSafePointsVisible);
  const toggleHeatmap = useSafetyStore((s) => s.toggleHeatmap);
  const toggleSafePoints = useSafetyStore((s) => s.toggleSafePoints);

  return (
    <div className="map-layer-controls">
      <button 
        className={`layer-control-btn ${isHeatmapVisible ? 'active' : ''}`}
        onClick={toggleHeatmap}
        aria-label="Toggle Heatmap"
        title="Toggle Heatmap"
      >
        <Map size={20} />
      </button>
      <div className="layer-control-divider" />
      <button 
        className={`layer-control-btn ${isSafePointsVisible ? 'active' : ''}`}
        onClick={toggleSafePoints}
        aria-label="Toggle Safe Places"
        title="Toggle Safe Places"
      >
        <MapPin size={20} />
      </button>
    </div>
  );
};

export default MapLayerControls;
