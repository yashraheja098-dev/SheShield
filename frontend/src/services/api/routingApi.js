import { calculateSafetyScore } from '../../utils/safetyScore';
import useReportStore from '../../stores/reportStore';

export const routingApi = {
  /**
   * Get safe route options between two points using OSRM.
   * Real API: GET /route/v1/driving/{lon},{lat};{lon},{lat}
   */
  getSafeRoutes: async (origin, destination) => {
    try {
      // OSRM expects coordinates in lon,lat order
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Routing failed');
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }

      // Map OSRM routes to our RouteOption format
      return data.routes.map((route, index) => {
        const distance = route.distance; // in meters
        const duration = route.duration; // in seconds
        
        // OSRM geojson geometry returns array of [lon, lat]. 
        // Leaflet Polyline expects array of [lat, lon].
        const geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Fetch real-time community reports from Zustand
        const reports = useReportStore.getState().reports || [];

        // Use deterministic mock logic for safety score, now strictly augmented by real community reports
        const { score, warnings } = calculateSafetyScore(distance, index, geometry, reports);
        
        return {
          id: `route_${index}`,
          type: index === 0 ? 'safe' : (index === 1 ? 'fast' : 'balanced'),
          label: index === 0 ? 'Safest Route' : (index === 1 ? 'Fastest Route' : 'Balanced'),
          safetyScore: score,
          duration: duration,
          distance: distance,
          geometry: geometry,
          warnings: warnings,
        };
      });
    } catch (error) {
      console.error('Routing API error:', error);
      throw error;
    }
  }
};
