/**
 * Map configuration constants.
 * All map-related magic numbers live here.
 */

/** Default map center — New Delhi, India */
export const DEFAULT_CENTER = [28.6139, 77.2090];
export const DEFAULT_ZOOM = 14;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 19;
export const NAVIGATION_ZOOM = 17;

/** CartoDB tile providers (no API key required) */
export const TILE_PROVIDERS = {
  DARK: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
      ' &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  LIGHT: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
      ' &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
};

/** Active tile for MVP (dark for premium look) */
export const ACTIVE_TILE = TILE_PROVIDERS.DARK;

/** Safety thresholds */
export const DEVIATION_THRESHOLD_METERS = 250;
export const SAFEPOINTS_SEARCH_RADIUS_METERS = 2000;

/** Fly-to animation config */
export const FLY_DURATION_SECONDS = 1.4;
