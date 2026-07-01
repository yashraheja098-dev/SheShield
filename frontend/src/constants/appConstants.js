/**
 * Application-wide constants and enumerations.
 * Components import from here — never hardcode display strings.
 */

export const APP_NAME = 'SheShield';
export const APP_TAGLINE = 'Navigate Safe. Stay Protected.';

/* ── LocalStorage Keys ── */
export const STORAGE_KEYS = {
  ONBOARDED:        'ss_onboarded',
  TRUSTED_CONTACTS: 'ss_trusted_contacts',
  RECENT_SEARCHES:  'ss_recent_searches',
  USER_PROFILE:     'ss_user_profile',
};

/* ── Safe Point Types ──
   Each type has: id, label, emoji, color, alwaysOpen flag.
   Future: driven by backend config.
*/
export const SAFE_POINT_TYPES = {
  POLICE:      { id: 'police',      label: 'Police Station',    emoji: '🚔', color: '#4285F4', alwaysOpen: true  },
  HOSPITAL:    { id: 'hospital',    label: 'Hospital',          emoji: '🏥', color: '#00C853', alwaysOpen: true  },
  PETROL_PUMP: { id: 'petrol_pump', label: 'Petrol Pump',       emoji: '⛽', color: '#FF9800', alwaysOpen: false },
  METRO:       { id: 'metro',       label: 'Metro Station',     emoji: '🚇', color: '#9C27B0', alwaysOpen: false },
  RAILWAY:     { id: 'railway',     label: 'Railway Station',   emoji: '🚂', color: '#795548', alwaysOpen: true  },
  BUS_STAND:   { id: 'bus_stand',   label: 'Bus Stand',         emoji: '🚌', color: '#F44336', alwaysOpen: false },
  PHARMACY:    { id: 'pharmacy',    label: '24x7 Pharmacy',     emoji: '💊', color: '#00BCD4', alwaysOpen: true  },
  HOTEL:       { id: 'hotel',       label: 'Verified Hotel',    emoji: '🏨', color: '#607D8B', alwaysOpen: true  },
  WOMENS_DESK: { id: 'womens_desk', label: "Women's Help Desk", emoji: '👩', color: '#E91E8C', alwaysOpen: true  },
};

/* ── Time of Day Slots ── */
export const TIME_SLOTS = {
  DAWN:  { id: 'dawn',  label: 'Dawn',  icon: '🌅', hours: [5,  7],  safetyNote: 'Moderate vigilance recommended' },
  DAY:   { id: 'day',   label: 'Day',   icon: '☀️', hours: [7,  18], safetyNote: 'Generally safe — stay aware' },
  DUSK:  { id: 'dusk',  label: 'Dusk',  icon: '🌆', hours: [18, 20], safetyNote: 'Heightened caution advised' },
  NIGHT: { id: 'night', label: 'Night', icon: '🌙', hours: [20, 5],  safetyNote: 'High vigilance — use safe routes' },
};

/* ── App Operational Modes ── */
export const APP_MODES = {
  IDLE:       'idle',
  SEARCHING:  'searching',
  PLANNING:   'planning',
  NAVIGATING: 'navigating',
};

/* ── Bottom Sheet Snap States ── */
export const SHEET_STATES = {
  HIDDEN:    'hidden',
  PEEK:      'peek',      /* ~120px — handle + summary only */
  HALF:      'half',      /* ~45vh  — route cards visible   */
  EXPANDED:  'expanded',  /* ~80vh  — full content          */
};

/* ── Route Types ── */
export const ROUTE_TYPES = {
  SAFE:       { id: 'safe', label: 'Safest Route',  icon: '🛡️' },
  FAST:       { id: 'fast', label: 'Fastest Route', icon: '⚡' },
  BALANCED:   { id: 'balanced', label: 'Balanced',  icon: '⚖️' },
};

/* ── Safety Score Thresholds ── */
export const SAFETY_SCORE = {
  HIGH:   { min: 80, label: 'High Safety',   color: 'var(--color-safe)' },
  MEDIUM: { min: 55, label: 'Moderate',      color: 'var(--color-caution)' },
  LOW:    { min: 0,  label: 'Use Caution',   color: 'var(--color-danger)' },
};

/** Get safety score band from a numeric score 0–100 */
export const getSafetyBand = (score) => {
  if (score >= SAFETY_SCORE.HIGH.min)   return SAFETY_SCORE.HIGH;
  if (score >= SAFETY_SCORE.MEDIUM.min) return SAFETY_SCORE.MEDIUM;
  return SAFETY_SCORE.LOW;
};
