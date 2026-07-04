/**
 * SOSButton — Pulsing emergency FAB + 5-second countdown overlay.
 *
 * Interaction flow:
 *   Tap → countdown starts (5 → 0)
 *   During countdown: tap again OR tap CANCEL → abort
 *   Countdown reaches 0 → SOS activates (Phase 3: contacts alerted)
 */
import { Shield } from 'lucide-react';
import useSosStore from '../../../stores/sosStore';
import './SOSButton.css';

/* ── Countdown Overlay ── */
const SOSCountdown = ({ countdown, onCancel }) => (
  <div
    className="sos-overlay"
    role="alertdialog"
    aria-modal="true"
    aria-label="SOS countdown"
  >
    <div className="sos-overlay-card anim-scale-in-spring">
      {/* SVG countdown ring */}
      <div className="sos-ring-container">
        <svg className="sos-ring-svg" viewBox="0 0 100 100">
          <circle
            className="sos-ring-track"
            cx="50" cy="50" r="45"
            fill="none" strokeWidth="6"
          />
          <circle
            className="sos-ring-progress"
            cx="50" cy="50" r="45"
            fill="none" strokeWidth="6"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * (5 - countdown)) / 5}
          />
        </svg>
        <span className="sos-ring-number">{countdown}</span>
      </div>

      <p className="sos-overlay-title">Sending SOS Alert</p>
      <p className="sos-overlay-subtitle">
        Your trusted contacts will be notified with your live location
      </p>

      <button
        id="sos-cancel-btn"
        className="sos-cancel-btn"
        onClick={onCancel}
        autoFocus
      >
        Cancel
      </button>
    </div>
  </div>
);

/* ── Active SOS Screen ── */
const SOSActiveScreen = ({ onResolve }) => (
  <div className="sos-active-screen" role="alertdialog" aria-modal="true">
    <div className="sos-active-content anim-scale-in">
      <div className="sos-active-icon">
        <Shield size={48} />
      </div>
      <h2 className="sos-active-title">SOS Activated</h2>
      <p className="sos-active-subtitle">
        Emergency mode is active. Stay calm — press Call 112 to reach emergency services directly.
      </p>

      <div className="sos-active-number">
        <a href="tel:112" className="sos-call-btn">📞 Call 112</a>
      </div>

      <button className="sos-safe-btn" onClick={onResolve}>
        I'm Safe Now
      </button>
    </div>
  </div>
);

/* ── Main Component ── */
const SOSButton = () => {
  const {
    isActive,
    isCountingDown,
    countdown,
    beginCountdown,
    cancelCountdown,
    resolveEmergency,
  } = useSosStore();

  return (
    <>
      {/* Countdown modal */}
      {isCountingDown && (
        <SOSCountdown countdown={countdown} onCancel={cancelCountdown} />
      )}

      {/* Active SOS full-screen overlay */}
      {isActive && (
        <SOSActiveScreen onResolve={resolveEmergency} />
      )}

      {/* FAB — always visible unless SOS is active */}
      {!isActive && (
        <button
          id="sos-fab"
          className={`sos-fab ${isCountingDown ? 'counting' : ''}`}
          onClick={isCountingDown ? cancelCountdown : beginCountdown}
          aria-label="SOS emergency button"
        >
          <span className="sos-fab-ring" aria-hidden="true" />
          <span className="sos-fab-ring sos-fab-ring--2" aria-hidden="true" />
          <span className="sos-fab-label">SOS</span>
        </button>
      )}
    </>
  );
};

export default SOSButton;
