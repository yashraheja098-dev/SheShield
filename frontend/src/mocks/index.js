/**
 * mockApi — All API calls go through this module in MVP.
 *
 * Every function:
 *   1. Simulates realistic network latency
 *   2. Returns the exact shape the real API will return
 *   3. Can be hot-swapped by changing the import in service files
 *
 * To connect real backend: replace these implementations with
 * axios calls to the real endpoints. Zero component changes needed.
 */
import {
  generateMockHeatmapData,
  generateMockSafePoints,
  MOCK_SEARCH_RESULTS,
} from './safetyData';

/** Simulated network delay */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Jitter: returns a value ±20% of base */
const jitter = (base) => base + (Math.random() - 0.5) * base * 0.4;

export const mockApi = {
  /**
   * Geocode / autocomplete search.
   * Real API: GET /geocode/search?q={query}
   */
  searchPlaces: async (query) => {
    await delay(jitter(320));
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_SEARCH_RESULTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  },

  /**
   * Reverse geocode a coordinate to a place name.
   * Real API: GET /geocode/reverse?lat={lat}&lng={lng}
   */
  reverseGeocode: async (lat, lng) => {
    await delay(jitter(280));
    return {
      name:     'Current Location',
      subtitle: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      lat,
      lng,
    };
  },

  /**
   * Get safe route options between two points.
   * Real API: POST /route/safe  { origin, destination }
   */
  getSafeRoutes: async (origin, destination) => {
    await delay(jitter(850));

    // Straight-line midpoint for mock geometry (Phase 2 will draw real polylines)
    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;

    return [
      {
        id:           'route_safe',
        type:         'safe',
        label:        'Safest Route',
        safetyScore:  92,
        duration:     1440,   /* seconds */
        distance:     4200,   /* meters  */
        geometry:     [
          [origin.lat, origin.lng],
          [midLat + 0.005, midLng + 0.002],
          [destination.lat, destination.lng],
        ],
        warnings:     [],
      },
      {
        id:           'route_fast',
        type:         'fast',
        label:        'Fastest Route',
        safetyScore:  64,
        duration:     980,
        distance:     3100,
        geometry:     [
          [origin.lat, origin.lng],
          [midLat - 0.003, midLng - 0.002],
          [destination.lat, destination.lng],
        ],
        warnings:     ['Passes through low-lit area', 'Isolated stretch after 10 PM'],
      },
    ];
  },

  /**
   * Fetch heat map intensity tiles for a given time slot around lat, lng.
   * Real API: GET /safety/heatmap?slot={timeSlotId}&lat={lat}&lng={lng}
   */
  getHeatMapData: async (timeSlotId, lat, lng) => {
    await delay(jitter(400));
    // Night/dusk → higher intensities; day → dampened
    const multiplier = timeSlotId === 'night' ? 1.0
                     : timeSlotId === 'dusk'  ? 0.85
                     : timeSlotId === 'dawn'  ? 0.65
                     : 0.45;
                     
    // Generate data around the user's location
    const heatmapData = generateMockHeatmapData(lat, lng);
    
    return heatmapData.map(([ptLat, ptLng, intensity]) => [
      ptLat,
      ptLng,
      Math.min(intensity * multiplier, 1),
    ]);
  },

  /**
   * Get safe points within radius of a coordinate.
   * Real API: GET /safepoints?lat={lat}&lng={lng}&radius={r}&type={type}
   */
  getSafePoints: async (lat, lng, radiusM, type = null) => {
    await delay(jitter(480));
    const points = generateMockSafePoints(lat, lng);
    return points.filter((p) => !type || p.type === type);
  },
};
