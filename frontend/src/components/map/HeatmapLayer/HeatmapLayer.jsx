import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import useSafetyStore from '../../../stores/safetyStore';

const HeatmapLayer = () => {
  const map = useMap();
  const heatMapData = useSafetyStore((s) => s.heatMapData);
  const isHeatmapVisible = useSafetyStore((s) => s.isHeatmapVisible);
  const timeSlot = useSafetyStore((s) => s.timeSlot);
  
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!isHeatmapVisible || !heatMapData || heatMapData.length === 0) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Adapt visualization based on time of day
    // Night gets larger radius and higher blur to emphasize danger zones
    const radius = timeSlot.id === 'night' ? 35 : (timeSlot.id === 'day' ? 20 : 25);
    const blur = timeSlot.id === 'night' ? 25 : 15;
    
    // Customize gradient to blend with dark map
    const gradient = {
      0.2: 'rgba(0, 0, 255, 0)',
      0.4: 'cyan',
      0.6: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    };

    if (!heatLayerRef.current) {
      heatLayerRef.current = L.heatLayer(heatMapData, {
        radius,
        blur,
        maxZoom: 15,
        gradient,
        minOpacity: 0.3
      }).addTo(map);
    } else {
      heatLayerRef.current.setLatLngs(heatMapData);
      heatLayerRef.current.setOptions({ radius, blur, gradient });
      if (!map.hasLayer(heatLayerRef.current)) {
        heatLayerRef.current.addTo(map);
      }
    }

    return () => {
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, heatMapData, isHeatmapVisible, timeSlot]);

  return null; // Heatmap does not render React children
};

export default HeatmapLayer;
