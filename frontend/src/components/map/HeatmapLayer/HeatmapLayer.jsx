import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import useSafetyStore from '../../../stores/safetyStore';
import useReportStore from '../../../stores/reportStore';

const HeatmapLayer = () => {
  const map = useMap();
  const heatMapData = useSafetyStore((s) => s.heatMapData);
  const isHeatmapVisible = useSafetyStore((s) => s.isHeatmapVisible);
  const timeSlot = useSafetyStore((s) => s.timeSlot);
  const reports = useReportStore((s) => s.reports);
  
  const heatLayerRef = useRef(null);

  // Combine external mock API heatmap data with local community reports
  const combinedHeatMapData = useMemo(() => {
    const combined = [...(heatMapData || [])];
    
    if (reports && reports.length > 0) {
      reports.forEach(report => {
        if (report.position && report.position.length >= 2) {
          // [lat, lng, intensity]
          combined.push([report.position[0], report.position[1], 0.6]);
        }
      });
    }
    
    return combined;
  }, [heatMapData, reports]);

  useEffect(() => {
    if (!map) return;

    if (!isHeatmapVisible || combinedHeatMapData.length === 0) {
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

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    heatLayerRef.current = L.heatLayer(combinedHeatMapData, {
      radius,
      blur,
      maxZoom: 15,
      gradient,
      minOpacity: 0.3
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, combinedHeatMapData, isHeatmapVisible, timeSlot]);

  return null; // Heatmap does not render React children
};

export default HeatmapLayer;
