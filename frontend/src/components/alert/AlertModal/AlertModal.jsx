import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import useAlertStore from '../../../stores/alertStore';
import './AlertModal.css';

const AlertModal = () => {
  const isModalVisible = useAlertStore((s) => s.isModalVisible);
  const hideModal = useAlertStore((s) => s.hideModal);
  
  const [showToast, setShowToast] = useState(false);

  if (!isModalVisible && !showToast) return null;

  const handleReturn = () => {
    hideModal();
  };

  const handleSafe = () => {
    hideModal();
  };

  const handleAlert = () => {
    hideModal();
    // Simulate premium toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
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

      {/* Simulated Toast for Hackathon Demo */}
      {showToast && (
        <div className="alert-toast">
          <ShieldAlert size={18} />
          Emergency alert sent. Live location sharing activated.
        </div>
      )}
    </>
  );
};

export default AlertModal;
