/**
 * Geo-math utility functions.
 * Pure functions — no side effects, no imports.
 */

const EARTH_RADIUS_M = 6371000;

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Haversine distance between two [lat, lng] points, in meters.
 * Used for deviation detection and safe-point radius filtering.
 */
export const haversineDistance = ([lat1, lng1], [lat2, lng2]) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Compass bearing (0–360°) from point A to point B.
 */
export const getBearing = ([lat1, lng1], [lat2, lng2]) => {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
};

/**
 * Get a lat/lng bounding box for a center + radius (meters).
 * Used to pre-filter safe points before exact distance calc.
 */
export const getBoundingBox = ([lat, lng], radiusM) => {
  const latDelta = (radiusM / EARTH_RADIUS_M) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos(toRad(lat));
  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east:  lng + lngDelta,
    west:  lng - lngDelta,
  };
};

/**
 * Find the closest point on a route polyline to a given position.
 * Returns { point, segmentIndex, distance }.
 * Used for deviation monitoring.
 */
export const closestPointOnRoute = (position, routeCoords) => {
  let minDist = Infinity;
  let closestPoint = null;
  let closestSegment = 0;

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const A = routeCoords[i];
    const B = routeCoords[i + 1];
    // Project position onto segment AB (simplified 2D projection)
    const ax = B[1] - A[1], ay = B[0] - A[0];
    const bx = position[1] - A[1], by = position[0] - A[0];
    const t = Math.max(0, Math.min(1, (bx * ax + by * ay) / (ax ** 2 + ay ** 2)));
    const proj = [A[0] + t * ay, A[1] + t * ax];
    const dist = haversineDistance(position, proj);
    if (dist < minDist) {
      minDist = dist;
      closestPoint = proj;
      closestSegment = i;
    }
  }

  return { point: closestPoint, segmentIndex: closestSegment, distance: minDist };
};
