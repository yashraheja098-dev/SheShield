/**
 * useGeolocation — Browser Geolocation API wrapper.
 *
 * Returns the initial position once.
 * Phase 3 will add a watchPosition hook for continuous tracking.
 */
import { useState, useEffect, useCallback } from 'react';

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 30_000,
};

/**
 * @returns {{ position: GeoPosition|null, error: string|null, isLoading: boolean }}
 */
const useGeolocation = (continuous = false) => {
  const [position, setPosition] = useState(null);
  const [error,    setError]    = useState(null);
  const [isLoading,setIsLoading]= useState(true);

  const onSuccess = useCallback((pos) => {
    setPosition({
      lat:      pos.coords.latitude,
      lng:      pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading:  pos.coords.heading ?? null,
      speed:    pos.coords.speed   ?? null,
      timestamp:pos.timestamp,
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const onError = useCallback((err) => {
    setError(err.message);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let watchId;
    let cancelled = false;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      return;
    }

    // Always get initial position first
    navigator.geolocation.getCurrentPosition(
      (pos) => { if (!cancelled) onSuccess(pos); },
      (err) => { if (!cancelled) onError(err);   },
      GEO_OPTIONS
    );

    if (continuous) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => { if (!cancelled) onSuccess(pos); },
        (err) => { if (!cancelled) onError(err);   },
        GEO_OPTIONS
      );
    }

    return () => {
      cancelled = true;
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [onSuccess, onError, continuous]);

  return { position, error, isLoading };
};

export default useGeolocation;
