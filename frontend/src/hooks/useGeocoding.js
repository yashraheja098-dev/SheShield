import { useState, useEffect, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export const useGeocoding = () => {
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  
  // We need PlacesService to get lat/lng from place_id without using Geocoder API calls directly if possible,
  // but geocoder is actually simpler and often cheaper/more robust for simple place_id to lat/lng.
  
  useEffect(() => {
    if (placesLib && !autocompleteService) {
      setAutocompleteService(new placesLib.AutocompleteService());
    }
  }, [placesLib, autocompleteService]);

  useEffect(() => {
    if (geocodingLib && !geocoder) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib, geocoder]);

  const searchPlaces = useCallback(async (query, userPosition) => {
    if (!query || !query.trim()) return [];
    
    // Primary: Google Places Autocomplete
    if (autocompleteService) {
      try {
        const request = {
          input: query,
          componentRestrictions: { country: 'in' },
        };
        
        if (userPosition && userPosition.length === 2 && window.google) {
          request.locationBias = new window.google.maps.Circle({
            center: { lat: userPosition[0], lng: userPosition[1] },
            radius: 50000, // 50km radius bias
          });
        }
        
        const response = await autocompleteService.getPlacePredictions(request);
        
        if (response && response.predictions) {
          return response.predictions.map(p => ({
            id: p.place_id,
            name: p.structured_formatting.main_text,
            subtitle: p.structured_formatting.secondary_text || '',
            lat: null, // Will be fetched on select
            lng: null,
            type: 'place'
          }));
        }
      } catch (err) {
        console.warn('Google Autocomplete failed or returned no results, falling back to Nominatim:', err);
      }
    }

    // Fallback: Nominatim OpenStreetMap search
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
      
      if (userPosition && userPosition.length === 2) {
        const lat = userPosition[0];
        const lng = userPosition[1];
        url += `&viewbox=${lng - 0.2},${lat + 0.2},${lng + 0.2},${lat - 0.2}&bounded=0`;
      }
      
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      const results = data.map((item) => {
        const nameParts = item.display_name.split(',');
        return {
          id: item.place_id.toString(),
          name: nameParts[0].trim(),
          subtitle: nameParts.slice(1).join(',').trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: 'place'
        };
      });
      
      return results;
    } catch (error) {
      console.error('Nominatim search error:', error);
      return [];
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId) => {
    if (!geocoder) return null;
    try {
      const geoRes = await geocoder.geocode({ placeId });
      if (geoRes.results && geoRes.results.length > 0) {
        const loc = geoRes.results[0].geometry.location;
        return { lat: loc.lat(), lng: loc.lng() };
      }
    } catch (e) {
      console.warn("Geocoding failed for place_id", placeId, e);
    }
    return null;
  }, [geocoder]);
  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!geocoder) {
      return {
        name: 'Current Location',
        subtitle: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng
      };
    }
    
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        
        let nameParts = [];
        const addressComponents = result.address_components;
        if (addressComponents.length > 0) {
          const sublocality = addressComponents.find(c => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'));
          const locality = addressComponents.find(c => c.types.includes('locality'));
          const route = addressComponents.find(c => c.types.includes('route'));
          const poi = addressComponents.find(c => c.types.includes('point_of_interest'));
          
          if (poi) nameParts.push(poi.long_name);
          else if (sublocality) nameParts.push(sublocality.long_name);
          else if (route) nameParts.push(route.long_name);
          else if (addressComponents[0]) nameParts.push(addressComponents[0].long_name);
          
          if (locality && locality.long_name !== nameParts[0]) {
            nameParts.push(locality.long_name);
          }
        }
        
        let name = nameParts.length > 0 ? nameParts.join(', ') : 'Selected Location';

        return {
          name,
          subtitle: result.formatted_address,
          lat,
          lng
        };
      }
      throw new Error("No results found");
    } catch (error) {
      console.warn('Reverse geocoding failed: The Google Geocoding API might be disabled on this API key. Please enable it in the Google Cloud Console for exact locality names.');
      return {
        name: 'My Location',
        subtitle: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        lat,
        lng
      };
    }
  }, [geocoder]);

  return { searchPlaces, getPlaceDetails, reverseGeocode, isReady: true };
};
