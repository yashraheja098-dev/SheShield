/**
 * BottomSheet — Glass bottom panel with time-of-day safety context.
 *
 * Phase 1: Empty state with quick-action chips and time badge.
 * Phase 2: Will contain RouteCards and RouteSelector.
 * Phase 3: Will add SafePointPanel.
 *
 * The component accepts `children` so Phase 2 can inject content
 * without modifying this file.
 */
import { Shield } from 'lucide-react';
import { getTimeSlot, getTimeSafetyLevel } from '../../../utils/timeOfDay';
import './BottomSheet.css';

/* ── Time of Day Safety Badge ── */
const TimeBadge = () => {
  const slot  = getTimeSlot();
  const level = getTimeSafetyLevel();

  const levelClass = {
    low:    'badge--safe',
    medium: 'badge--caution',
    high:   'badge--danger',
  }[level.level];

  return (
    <div className={`time-badge ${levelClass}`}>
      <span className="time-badge-icon" aria-hidden="true">{slot.icon}</span>
      <span className="time-badge-slot">{slot.label}</span>
      <span className="time-badge-divider" aria-hidden="true">·</span>
      <span className="time-badge-level">{level.label}</span>
    </div>
  );
};

/* ── Quick Destination Chip ── */
const QuickChip = ({ emoji, label, id }) => (
  <button id={id} className="quick-chip" aria-label={`Navigate to ${label}`}>
    <span className="quick-chip-icon" aria-hidden="true">{emoji}</span>
    <span className="quick-chip-label">{label}</span>
  </button>
);

/* ── Empty State (Phase 1) ── */
const EmptyState = () => (
  <div className="bs-empty-state">
    <TimeBadge />

    <div className="bs-empty-hero">
      <div className="bs-shield-icon" aria-hidden="true">
        <Shield size={30} strokeWidth={1.8} />
      </div>
      <div className="bs-empty-text">
        <h2 className="bs-empty-title">Plan a Safe Route</h2>
        <p className="bs-empty-subtitle">
          Search your destination to get AI-powered safe route recommendations
        </p>
      </div>
    </div>

    <div className="bs-quick-actions" role="group" aria-label="Quick destinations">
      <QuickChip id="chip-police"   emoji="🚔" label="Nearest Police"  />
      <QuickChip id="chip-hospital" emoji="🏥" label="Hospital"        />
      <QuickChip id="chip-metro"    emoji="🚇" label="Metro Station"   />
      <QuickChip id="chip-pharmacy" emoji="💊" label="24/7 Pharmacy"   />
    </div>
  </div>
);

/* ── Main BottomSheet ── */
const BottomSheet = ({ children }) => {
  return (
    <div className="bottom-sheet anim-slide-up" role="complementary" aria-label="Route panel">

      {/* Drag handle */}
      <div className="bs-handle-row" aria-hidden="true">
        <div className="bs-handle" />
      </div>

      {/* Content */}
      <div className="bs-content">
        {children ?? <EmptyState />}
      </div>

    </div>
  );
};

export default BottomSheet;
