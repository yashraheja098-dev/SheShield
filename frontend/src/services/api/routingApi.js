/**
 * routingApi — Fetches safety-ranked route alternatives from the SheShield backend.
 *
 * Replaces the previous OSRM + fake safety score approach.
 * Backend calls Google Routes API (or mock fallback) and returns routes
 * pre-sorted by safety score descending. The encoded polyline is decoded
 * here so the rest of the frontend gets the same [[lat,lng], ...] geometry
 * it already expects.
 */
import axiosInstance from './axiosInstance';

/**
 * Decode a Google encoded polyline string into [[lat, lng], ...].
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
const decodePolyline = (encoded) => {
  const coords = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
};

/**
 * Parse backend duration string ("750s") → number of seconds.
 */
const parseDuration = (durationStr) => {
  if (typeof durationStr === 'number') return durationStr;
  if (typeof durationStr === 'string') {
    return parseInt(durationStr.replace('s', ''), 10) || 0;
  }
  return 0;
};

/**
 * Derive a frontend route type from its index in the safety-sorted list.
 * Backend already sorts safest-first.
 */
const deriveType = (index) => {
  if (index === 0) return 'safe';
  if (index === 1) return 'fast';
  return 'balanced';
};

const deriveLabel = (routeLabel, index) => {
  if (routeLabel && routeLabel !== 'Alternative Route') return routeLabel;
  if (index === 0) return 'Safest Route';
  if (index === 1) return 'Fastest Route';
  return 'Balanced';
};

export const routingApi = {
  /**
   * Get safety-ranked route options between two points.
   * Calls POST /api/routes/analyze on the SheShield backend.
   *
   * @param {{ lat: number, lng: number, name?: string }} origin
   * @param {{ lat: number, lng: number, name?: string }} destination
   * @param {string} travelMode - The mode of travel (WALK, BICYCLE, DRIVE)
   * @returns {Promise<RouteOption[]>}
   */
  getSafeRoutes: async (origin, destination, travelMode = "WALK") => {
    try {
      // Backend accepts address strings OR { latitude, longitude } objects
      const res = await axiosInstance.post('/routes/analyze', {
        origin:      { latitude: origin.lat,      longitude: origin.lng },
        destination: { latitude: destination.lat, longitude: destination.lng },
        travelMode
      });

      const rawRoutes = res.data?.routes || [];

      return rawRoutes.map((route, index) => {
        const geometry = decodePolyline(route.polyline);

        return {
          id:           `route_${index}`,
          type:         deriveType(index),
          label:        deriveLabel(route.routeLabel, index),
          safetyScore:  route.safetyScore,
          riskLevel:    route.riskLevel,
          duration:     parseDuration(route.duration),
          distance:     route.distance,
          geometry,
          polyline:     route.polyline,
          // Backend returns safetyExplanation; map to warnings for existing RouteCards
          warnings:     route.safetyExplanation || [],
          isMock:       route.isMock || false,
        };
      });
    } catch (error) {
      console.error('Routing API error:', error);
      throw error;
    }
  },
};
