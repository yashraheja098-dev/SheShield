/**
 * Human-readable formatters.
 * Pure functions — deterministic, no side effects.
 */

/**
 * Format meters to a readable distance string.
 * @param {number} meters
 * @returns {string} e.g. "450 m" | "3.2 km"
 */
export const formatDistance = (meters) => {
  if (!meters && meters !== 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format seconds to a readable duration string.
 * @param {number} seconds
 * @returns {string} e.g. "8 min" | "1h 20m"
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
};

/**
 * Format ETA based on current time + remaining seconds.
 * @param {number} remainingSeconds
 * @returns {string} e.g. "9:45 PM"
 */
export const formatETA = (remainingSeconds) => {
  if (!remainingSeconds) return '—';
  const eta = new Date(Date.now() + remainingSeconds * 1000);
  return eta.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a safety score (0–100) as a display string.
 * @param {number} score
 * @returns {string} e.g. "92/100"
 */
export const formatSafetyScore = (score) => `${Math.round(score)}/100`;
