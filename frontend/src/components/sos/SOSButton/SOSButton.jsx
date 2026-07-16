/**
 * SOSButton — Pulsing emergency FAB + 3-second countdown overlay.
 *
 * Interaction flow:
 *   Tap → countdown starts (3 → 0)
 *   During countdown: tap again OR tap CANCEL → abort
 *   Countdown reaches 0 → SOS activates → backend notified
 */
import React, { useEffect, useState } from 'react';
import { Shield, MapPin, AlertTriangle, Users, MicOff, RefreshCw, MessageCircle } from 'lucide-react';
import useSosStore from '../../../stores/sosStore';
import useNavigationStore from '../../../stores/navigationStore';
import axiosInstance from '../../../services/api/axiosInstance';
import './SOSButton.css';

/* ── Countdown Overlay ── */
const SOSCountdown = ({ countdown, onCancel, onActivateNow }) => (
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
            strokeDashoffset={283 - (283 * (3 - countdown)) / 3}
          />
        </svg>
        <span className="sos-ring-number">{countdown}</span>
      </div>

      <p className="sos-overlay-title">Sending SOS Alert</p>
      <p className="sos-overlay-subtitle">
        Your trusted contacts will be notified with your live location
      </p>

      <div className="sos-countdown-actions">
        <button
          id="sos-cancel-btn"
          className="sos-cancel-btn"
          onClick={onCancel}
          autoFocus
        >
          Cancel
        </button>
        <button
          className="sos-activate-now-btn"
          onClick={onActivateNow}
        >
          Activate Now
        </button>
      </div>
    </div>
  </div>
);

/* ── Active SOS Screen (Compact Panel) ── */
const SOSActiveScreen = ({ onResolve, apiStatus, userPosition, onRetry, contactsAlerted, triggeredAt }) => {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!triggeredAt) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - triggeredAt) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [triggeredAt]);

  const getWhatsAppLink = (contact) => {
    const lat = userPosition ? userPosition[0] : null;
    const lng = userPosition ? userPosition[1] : null;
    const mapsLink = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : 'location unavailable';
    const msg = `EMERGENCY SOS! I need help immediately. My location: ${mapsLink}`;
    
    // Basic formatting: ensure only digits, default to India (+91) if no country code
    const phone = contact.phone.replace(/[^\d+]/g, '');
    const finalPhone = phone.startsWith('+') ? phone.substring(1) : (phone.startsWith('91') ? phone : `91${phone}`);
    
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="sos-active-panel anim-slide-up" role="alertdialog" aria-modal="true">
      <div className="sos-active-header">
        <div className="sos-active-header-left">
          <div className="sos-active-icon-small">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="sos-active-title">SOS ACTIVE</h2>
            <div className="sos-active-time">{elapsed} elapsed</div>
          </div>
        </div>
        <a href="tel:112" className="sos-call-btn-small">📞 Call 112</a>
      </div>

      <div className="sos-status-list">
        <div className="sos-status-item">
          <MapPin size={16} />
          <span>Location: {userPosition ? "Ready & Shared" : "Unavailable"}</span>
        </div>
        
        <div className={`sos-status-item ${apiStatus === 'error' ? 'error' : ''}`}>
          <AlertTriangle size={16} />
          <span>Alert: {apiStatus === 'pending' ? 'Dispatching...' : apiStatus === 'success' ? 'Dispatched' : 'Failed to Dispatch'}</span>
          {apiStatus === 'error' && (
            <button className="sos-retry-btn" onClick={onRetry}><RefreshCw size={14} /></button>
          )}
        </div>

        <div className="sos-status-item">
          <Users size={16} />
          <span>Contacts: {apiStatus === 'success' ? (contactsAlerted?.length ? `App Alerts Sent (${contactsAlerted.length})` : 'None Configured') : 'Pending'}</span>
        </div>

        {apiStatus === 'success' && contactsAlerted?.length > 0 && (
          <div className="sos-whatsapp-section">
            <p className="sos-wa-title">Manual WhatsApp Share:</p>
            <div className="sos-wa-list">
              {contactsAlerted.map((contact, idx) => (
                <a 
                  key={idx}
                  href={getWhatsAppLink(contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sos-wa-btn"
                >
                  <MessageCircle size={14} />
                  <span>{contact.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="sos-status-item muted">
          <MicOff size={16} />
          <span>Recording: Not Configured</span>
        </div>
      </div>

      <div className="sos-active-actions">
        {confirmEnd ? (
          <div className="sos-confirm-end">
            <span>End SOS?</span>
            <button className="sos-btn-yes" onClick={onResolve}>Yes, End</button>
            <button className="sos-btn-no" onClick={() => setConfirmEnd(false)}>Cancel</button>
          </div>
        ) : (
          <button className="sos-safe-btn" onClick={() => setConfirmEnd(true)}>
            I'm Safe Now
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Component ── */
const SOSButton = () => {
  const {
    isActive,
    isCountingDown,
    isConfirmationReady,
    countdown,
    activeSosId,
    contactsAlerted,
    triggeredAt,
    beginCountdown,
    cancelCountdown,
    activateSOSNow,
    confirmActivation,
    resolveEmergency,
    setActiveSosId,
    alertContacts,
  } = useSosStore();

  const userPosition = useNavigationStore((s) => s.userPosition);
  const [apiStatus, setApiStatus] = useState('pending'); // 'pending' | 'success' | 'error'

  const triggerSOS = async () => {
    setApiStatus('pending');
    try {
      let finalLat = 0;
      let finalLng = 0;

      // Attempt to get fresh GPS location with a 5-second timeout
      if (navigator.geolocation) {
        try {
          const freshPosition = await Promise.race([
            new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              });
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('GPS timeout')), 5000)
            )
          ]);
          finalLat = freshPosition.coords.latitude;
          finalLng = freshPosition.coords.longitude;
        } catch (gpsError) {
          console.warn('Failed to get fresh GPS for SOS, falling back to cached position:', gpsError.message);
          if (userPosition) {
            finalLat = userPosition[0];
            finalLng = userPosition[1];
          }
        }
      } else if (userPosition) {
        finalLat = userPosition[0];
        finalLng = userPosition[1];
      }

      const body = new FormData();
      body.append('latitude', String(finalLat));
      body.append('longitude', String(finalLng));

      const res = await axiosInstance.post('/sos', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const sosLog = res.data?.sosLog || res.data?.data?.sosLog;
      if (sosLog?._id) setActiveSosId(sosLog._id);
      const contacts = res.data?.trustedContacts || res.data?.data?.trustedContacts || [];
      if (contacts.length) alertContacts(contacts);
      setApiStatus('success');
    } catch (err) {
      console.error('SOS backend trigger failed:', err);
      setApiStatus('error');
    }
  };

  // When SOS activates, call backend (non-blocking)
  useEffect(() => {
    if (!isActive) return;
    triggerSOS();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleResolve = async () => {
    // Call backend resolve if we have an active SOS id
    if (activeSosId) {
      try {
        await axiosInstance.patch(`/sos/${activeSosId}/resolve`);
      } catch (err) {
        console.error('SOS resolve failed (non-blocking):', err);
      }
    }
    setApiStatus('pending');
    resolveEmergency();
  };

  return (
    <>
      {/* Countdown modal */}
      {isCountingDown && (
        <SOSCountdown 
          countdown={countdown} 
          onCancel={cancelCountdown} 
          onActivateNow={activateSOSNow}
        />
      )}

      {/* Confirmation modal */}
      {isConfirmationReady && (
        <div className="sos-overlay" role="alertdialog" aria-modal="true">
          <div className="sos-overlay-card anim-scale-in-spring">
            <div className="sos-ring-container" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={48} color="#e91e63" />
            </div>
            <p className="sos-overlay-title">Emergency Alert Ready</p>
            <p className="sos-overlay-subtitle">
              The countdown has finished.<br />Do you want to send the SOS alert now?
            </p>
            <div className="sos-countdown-actions">
              <button
                className="sos-cancel-btn"
                onClick={cancelCountdown}
              >
                Cancel
              </button>
              <button
                className="sos-activate-now-btn"
                onClick={confirmActivation}
              >
                Activate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active SOS compact panel overlay */}
      {isActive && (
        <SOSActiveScreen 
          onResolve={handleResolve}
          apiStatus={apiStatus}
          userPosition={userPosition}
          onRetry={triggerSOS}
          contactsAlerted={contactsAlerted}
          triggeredAt={triggeredAt}
        />
      )}

      {/* FAB — always visible unless SOS is active or confirming */}
      {!isActive && !isConfirmationReady && (
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


