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
const useGeolocation = () => {
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
    let cancelled = false;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => { if (!cancelled) onSuccess(pos); },
      (err) => { if (!cancelled) onError(err);   },
      GEO_OPTIONS
    );

    return () => { cancelled = true; };
  }, [onSuccess, onError]);

  return { position, error, isLoading };
};

export default useGeolocation;
