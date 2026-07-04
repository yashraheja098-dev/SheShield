/**
 * safePointRanking.js — Route-aware safe point ranking utility.
 *
 * Single source of truth for ranking safe points during an active journey.
 * Used by both SafePointSuggestions and ActiveJourneyPanel so logic stays
 * consistent across the app.
 *
 * Algorithm:
 *  1. For each safe point, compute its minimum distance to the active route
 *     polyline via closestPointOnRoute (segment-projection, not just endpoints).
 *  2. Points within ROUTE_CORRIDOR_M are "in-corridor".
 *  3. In-corridor points are sorted: priorityTier → distToRoute → distToUser.
 *  4. If no corridor points exist, gracefully fall back to all safe points
 *     sorted by: priorityTier → distToUser.
 *  5. Returns sliced array annotated with { distToRoute, distToUser,
 *     priorityTier, inCorridor } so the UI can show meaningful labels.
 *
 * Pure function — no side effects, no store imports.
 */
import { closestPointOnRoute, haversineDistance } from './geoUtils';

/** Maximum distance from the route polyline to consider a safe point relevant. */
export const ROUTE_CORRIDOR_M = 750;

/**
 * Safety priority tier per safe-point type.
 * Lower tier = higher priority (police/womens_desk surface first).
 */
export const PRIORITY_TIER = {
  police:      1,
  womens_desk: 1,
  hospital:    2,
  pharmacy:    2,
  hotel:       3,
  petrol_pump: 3,
  metro:       4,
  railway:     4,
  bus_stand:   4,
};

/**
 * Rank safe points for the active navigation route.
 *
 * @param {Array}  safePoints    - safetyStore.safePoints array
 * @param {Array}  routeGeometry - active route.geometry [[lat,lng], ...]
 * @param {Array}  userPosition  - navigationStore.userPosition [lat, lng]
 * @param {number} [maxItems=3]  - how many results to return
 * @returns {Array} ranked safe points, each annotated with computed fields
 */
export const rankSafePointsForRoute = (
  safePoints,
  routeGeometry,
  userPosition,
  maxItems = 3
) => {
  if (!safePoints || safePoints.length === 0) return [];
  if (!userPosition) return [];

  const hasValidRoute =
    routeGeometry && routeGeometry.length >= 2;

  // Annotate every point with distances and tier
  const annotated = safePoints.map((point) => {
    const pos = [point.lat, point.lng];

    const distToUser = haversineDistance(userPosition, pos);

    // Only project onto route if geometry is available
    const distToRoute = hasValidRoute
      ? closestPointOnRoute(pos, routeGeometry).distance
      : Infinity;

    return {
      ...point,
      distToRoute,
      distToUser,
      priorityTier: PRIORITY_TIER[point.type] ?? 5,
      inCorridor: hasValidRoute && distToRoute <= ROUTE_CORRIDOR_M,
    };
  });

  // Separate corridor and non-corridor sets
  const inCorridor = annotated.filter((p) => p.inCorridor);

  if (inCorridor.length > 0) {
    // Primary path: rank corridor points
    return inCorridor
      .sort((a, b) => {
        if (a.priorityTier !== b.priorityTier) return a.priorityTier - b.priorityTier;
        if (a.distToRoute !== b.distToRoute)   return a.distToRoute  - b.distToRoute;
        return a.distToUser - b.distToUser;
      })
      .slice(0, maxItems);
  }

  // Fallback: no corridor points — rank all by priority then proximity to user
  return annotated
    .sort((a, b) => {
      if (a.priorityTier !== b.priorityTier) return a.priorityTier - b.priorityTier;
      return a.distToUser - b.distToUser;
    })
    .slice(0, maxItems);
};
