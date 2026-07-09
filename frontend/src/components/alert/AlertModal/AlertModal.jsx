import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import useAlertStore from '../../../stores/alertStore';
import useSosStore from '../../../stores/sosStore';
import SafePointSuggestions from '../../safety/SafePointSuggestions/SafePointSuggestions';
import './AlertModal.css';

const AlertModal = () => {
  const isModalVisible = useAlertStore((s) => s.isModalVisible);
  const hideModal = useAlertStore((s) => s.hideModal);
  const acknowledgeSafe = useAlertStore((s) => s.acknowledgeSafe);
  const activateSOSNow = useSosStore((s) => s.activateSOSNow);
  
  if (!isModalVisible) return null;

  const handleReturn = () => {
    hideModal();
  };

  const handleSafe = () => {
    acknowledgeSafe();
  };

  const handleAlert = () => {
    hideModal();
    // Trigger real SOS flow
    activateSOSNow();
  };

  return (
    <>
      {isModalVisible && (
        <div className="alert-modal-overlay">
        <div className="alert-modal-card">
          <div className="alert-modal-icon">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          
          <h2 className="alert-modal-title">
            You have deviated from the recommended safe route.
          </h2>
          <p className="alert-modal-message">
            Would you like to return to the recommended route?
          </p>

          {/* Smart nearby safe point suggestions */}
          <SafePointSuggestions maxItems={3} />

          <div className="alert-modal-actions">
            <button className="alert-btn alert-btn-return" onClick={handleReturn}>
              Return to Route
            </button>
            <button className="alert-btn alert-btn-safe" onClick={handleSafe}>
              I'm Safe
            </button>
            <button className="alert-btn alert-btn-alert" onClick={handleAlert}>
              Send Alert
            </button>
          </div>
        </div>
      </div>
      )}

    </>
  );
};

export default AlertModal;
