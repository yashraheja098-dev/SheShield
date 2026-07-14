import React from 'react';
import { ShieldCheck } from 'lucide-react';
import useSafetyStore from '../../../stores/safetyStore';
import useUiStore from '../../../stores/uiStore';
import { APP_MODES } from '../../../constants/appConstants';
import useMapStore from '../../../stores/mapStore';
import useNavigationStore from '../../../stores/navigationStore';
import './FindSafeSpotButton.css';

const FindSafeSpotButton = () => {
  const setSafePointsVisible = useSafetyStore((s) => s.setSafePointsVisible);
  const safePoints = useSafetyStore((s) => s.safePoints);
  const userPosition = useNavigationStore((s) => s.userPosition);
  const flyTo = useMapStore((s) => s.flyTo);
  const appMode = useUiStore((s) => s.appMode);
  const pushToast = useUiStore((s) => s.pushToast);

  // Hide in navigation or searching mode to reduce clutter
  if (appMode === APP_MODES.NAVIGATING || appMode === APP_MODES.SEARCHING) {
    return null;
  }

  const handleFindSafeSpot = () => {
    // 1. Ensure Safe Points layer is turned on
    setSafePointsVisible(true);

    // 2. Fly map to fit the closest safe points or just toggle it on
    if (safePoints.length === 0) {
      pushToast({ type: 'info', message: 'Fetching safe spots from Google Places...' });
    } else {
      pushToast({ type: 'success', message: 'Safe spots highlighted! Tap one to navigate immediately.' });
      
      // Optionally fly to the closest one
      if (userPosition && safePoints.length > 0) {
        // Find closest
        const closest = [...safePoints].sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
        if (closest && closest.lat && closest.lng) {
          flyTo([closest.lat, closest.lng], 15);
        }
      }
    }
  };

  return (
    <div className="find-safe-spot-container">
      <button 
        className="find-safe-spot-fab" 
        onClick={handleFindSafeSpot}
        aria-label="Find Nearby Safe Spot"
        title="Find Nearby Safe Spot"
      >
        <ShieldCheck size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default FindSafeSpotButton;
