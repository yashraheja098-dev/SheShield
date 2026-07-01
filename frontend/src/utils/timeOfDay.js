/**
 * Time-of-day classification utility.
 * Used by safetyStore and BottomSheet to show appropriate context.
 */
import { TIME_SLOTS } from '../constants/appConstants';

/**
 * Get the current time slot based on local hour.
 * @returns {object} TIME_SLOTS entry
 */
export const getTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 7)  return TIME_SLOTS.DAWN;
  if (hour >= 7  && hour < 18) return TIME_SLOTS.DAY;
  if (hour >= 18 && hour < 20) return TIME_SLOTS.DUSK;
  return TIME_SLOTS.NIGHT;
};

/**
 * Is it currently nighttime? (risky hours)
 * @returns {boolean}
 */
export const isNighttime = () => {
  const slot = getTimeSlot();
  return slot.id === 'night' || slot.id === 'dusk';
};

/**
 * Safety level label tied to time of day.
 * @returns {{ label: string, level: 'low'|'medium'|'high' }}
 */
export const getTimeSafetyLevel = () => {
  const slot = getTimeSlot();
  const map = {
    dawn:  { label: 'Moderate Vigilance', level: 'medium' },
    day:   { label: 'Generally Safe',     level: 'low'    },
    dusk:  { label: 'Stay Alert',         level: 'medium' },
    night: { label: 'High Vigilance',     level: 'high'   },
  };
  return map[slot.id];
};
