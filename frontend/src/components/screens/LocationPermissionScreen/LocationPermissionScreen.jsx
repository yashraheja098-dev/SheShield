import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import './LocationPermissionScreen.css';

const LocationPermissionScreen = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnableLocation = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Permission granted
        navigate('/app/navigation');
      },
      (error) => {
        // Permission denied or error
        setErrorMsg('Location permission is required for safe routing.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSkip = () => {
    navigate('/app/navigation');
  };

  return (
    <div className="location-perm-container">
      <div className="location-perm-glow" />
      
      <div className="location-perm-card">
        
        {/* Header */}
        <div className="location-perm-icon-wrapper">
          <MapPin size={36} strokeWidth={2.5} />
        </div>
        
        <div>
          <h1 className="location-perm-title">Enable Location</h1>
          <p className="location-perm-subtitle">
            SheShield uses your live location to calculate the safest routes, nearby police stations, hospitals, and emergency assistance.
          </p>
        </div>

        {/* Privacy Card */}
        <div className="location-privacy-box">
          <div className="location-privacy-title">
            <ShieldCheck size={18} />
            Your privacy matters.
          </div>
          <ul className="location-privacy-list">
            <li>Location is used only while navigating.</li>
            <li>Live location is shared only after SOS or when Alert Mode is enabled.</li>
            <li>We never track users unnecessarily.</li>
          </ul>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="location-error-msg">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="location-actions">
          {/* Note: We reuse login-btn styles since they are global-ish or we can just redefine them, 
              but it's better to just reuse the classes if they were global. Wait, .login-btn-primary is inside LoginScreen.css.
              Let's create matching local classes in LocationPermissionScreen.css or use inline for now.
              Actually, I can just use the identical styles. I will quickly add them to LocationPermissionScreen.css.
          */}
          <button type="button" className="location-btn-primary" onClick={handleEnableLocation}>
            Enable Location
          </button>
          <button type="button" className="location-btn-secondary" onClick={handleSkip}>
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
};

export default LocationPermissionScreen;
