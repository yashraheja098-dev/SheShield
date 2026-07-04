import { getTimeSlot } from './timeOfDay';
import { closestPointOnRoute } from './geoUtils';

/**
 * Deterministic mock safety score calculation for Phase 2.
 * Based on distance, time of day, route index, and simple coordinate hashing.
 * Based on distance, time of day, route index, community reports, and simple coordinate hashing.
 */
export const calculateSafetyScore = (distance, index, geometry, reports = []) => {
  const timeSlot = getTimeSlot();
  
  // Base score 0-100
  let score = 85;

  // 1. Time of day impact
  if (timeSlot.id === 'night') score -= 20;
  if (timeSlot.id === 'dusk') score -= 10;
  if (timeSlot.id === 'dawn') score -= 5;

  // 2. Distance impact (longer routes are slightly riskier)
  score -= Math.min(10, Math.floor(distance / 2000));

  // 3. Coordinate hashing (to make the score feel dynamic but deterministic)
  const midPoint = geometry[Math.floor(geometry.length / 2)];
  const hash = Math.floor(midPoint[0] * 10000 + midPoint[1] * 10000) % 15;
  
  // Apply hash adjustment (-7 to +7)
  score += (hash - 7);
  
  // 4. Index differentiation (route 0 is always best, route 1 is worse, etc.)
  if (index === 0) {
    score = Math.max(score, 75); // Route 0 (Safest) should always look relatively good
  } else if (index === 1) {
    score -= 15; // Route 1 (Fastest) is usually less safe
  } else {
    score -= 10;
  }
  
  // Clamp base score between 0 and 100 before report deductions
  score = Math.max(0, Math.min(100, score));
  
  // 5. Community Reports Impact
  let nearbyReportsCount = 0;
  if (reports && reports.length > 0 && geometry && geometry.length > 0) {
    reports.forEach(report => {
      if (report.position && report.position.length >= 2) {
        // closestPointOnRoute returns distance in meters
        const { distance: distToReport } = closestPointOnRoute(report.position, geometry);
        if (distToReport < 100) { // 100 meters threshold
          nearbyReportsCount++;
          score -= 10;
        }
      }
    });
  }

  // Final Clamp
  score = Math.max(0, Math.min(100, score));
  
  // Generate warnings based on score, time, and reports
  const warnings = [];
  if (nearbyReportsCount > 0) {
    warnings.push(`Passes near ${nearbyReportsCount} community report${nearbyReportsCount > 1 ? 's' : ''}`);
  }
  if (score < 60) warnings.push('Isolated stretch detected');
  if (timeSlot.id === 'night' && score < 80) warnings.push('Passes through low-lit area');
  if (index === 1 && nearbyReportsCount === 0) warnings.push('Higher traffic speed area');

  return { score, warnings };
};
