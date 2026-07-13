import { useState, useEffect, useRef } from 'react';
import { Search, X, Crosshair, ArrowUpDown } from 'lucide-react';
import useUiStore from '../../../stores/uiStore';
import useRouteStore from '../../../stores/routeStore';
import useNavigationStore from '../../../stores/navigationStore';
import { APP_MODES, SHEET_STATES } from '../../../constants/appConstants';
import { useDebounce } from '../../../hooks/useDebounce';
import { useGeocoding } from '../../../hooks/useGeocoding';
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions';
import './SearchBar.css';

const SearchBar = () => {
  const [pickupQuery, setPickupQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  
  const [focusedField, setFocusedField] = useState(null); // 'pickup' | 'dest' | null
  const [hasUserEditedPickup, setHasUserEditedPickup] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const { searchPlaces, reverseGeocode, isReady } = useGeocoding();

  const debouncedPickup = useDebounce(pickupQuery, 300);
  const debouncedDest = useDebounce(destQuery, 300);

  const setAppMode = useUiStore((s) => s.setAppMode);
  const setBottomSheet = useUiStore((s) => s.setBottomSheet);
  const appMode = useUiStore((s) => s.appMode);
  
  const setDestination = useRouteStore((s) => s.setDestination);
  const setOrigin = useRouteStore((s) => s.setOrigin);
  const userPosition = useNavigationStore((s) => s.userPosition);

  // Initialize Pickup Location
  useEffect(() => {
    if (hasUserEditedPickup || !isReady) return;

    if (!userPosition) {
      setPickupQuery("Fetching current location...");
    } else {
      // Reverse geocode on initial mount or when GPS becomes available
      reverseGeocode(userPosition[0], userPosition[1]).then(res => {
        if (!hasUserEditedPickup) {
          setPickupQuery(res.name || 'Current Location');
          setOrigin(res); // populate origin store initially
        }
      });
    }
  }, [userPosition, hasUserEditedPickup, setOrigin, isReady, reverseGeocode]);

  // Fetch Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const activeQuery = focusedField === 'pickup' ? debouncedPickup : debouncedDest;
      
      // Do not search if it's our default fetching string
      if (!activeQuery || activeQuery === "Fetching current location..." || activeQuery === "Current Location") {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      const results = await searchPlaces(activeQuery, userPosition);
      setSuggestions(results);
      setIsLoading(false);
      setActiveIndex(-1);
    };
    
    // Only fetch if searching mode and a field is focused
    if (appMode !== APP_MODES.PLANNING && focusedField && isReady) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedPickup, debouncedDest, focusedField, appMode, userPosition, isReady, searchPlaces]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocusedField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear destQuery when app returns to IDLE (e.g., Journey Ended)
  useEffect(() => {
    if (appMode === APP_MODES.IDLE) {
      setDestQuery('');
      setFocusedField(null);
    }
  }, [appMode]);

  const handleFocus = (field) => {
    setFocusedField(field);
    if (appMode !== APP_MODES.PLANNING) {
      setAppMode(APP_MODES.SEARCHING);
    }
  };

  const handleClear = (field) => {
    if (field === 'pickup') {
      setPickupQuery('');
      setHasUserEditedPickup(true);
      // Wait, clearing pickup shouldn't necessarily cancel a route completely, 
      // but the UI flow generally allows re-entering.
    } else {
      setDestQuery('');
      setAppMode(APP_MODES.IDLE);
      setBottomSheet(SHEET_STATES.PEEK);
      useRouteStore.getState().clearRoute();
    }
    setSuggestions([]);
  };

  const handleSwap = () => {
    // 1. Swap Text Strings
    const tempPickup = pickupQuery;
    setPickupQuery(destQuery);
    setDestQuery(tempPickup);
    setHasUserEditedPickup(true);

    // 2. Swap Underlying Store Objects
    // Reacts dynamically via RouteLayer when these change
    const currentOrigin = useRouteStore.getState().origin;
    const currentDestination = useRouteStore.getState().destination;
    
    if (currentOrigin || currentDestination) {
      setOrigin(currentDestination || null);
      setDestination(currentOrigin || null);
    }
  };

  const handleSelect = async (item) => {
    let selectedItem = item;

    // If item doesn't have lat/lng (came from Google Autocomplete), fetch details
    if (selectedItem.lat === null || selectedItem.lng === null) {
      setIsLoading(true);
      const details = await getPlaceDetails(selectedItem.id);
      setIsLoading(false);
      
      if (details) {
        selectedItem = { ...selectedItem, lat: details.lat, lng: details.lng };
      } else {
        console.error("Failed to fetch place details for", selectedItem.name);
        return; // Don't proceed if we can't get coordinates
      }
    }

    if (focusedField === 'pickup') {
      setPickupQuery(selectedItem.name);
      setHasUserEditedPickup(true);
      setOrigin(selectedItem);
      setFocusedField('dest'); // Automatically focus dest next
    } else {
      setDestQuery(selectedItem.name);
      setFocusedField(null);
      
      // Ensure origin is set to userPosition fallback if user didn't edit pickup but somehow the origin store is empty
      if (!hasUserEditedPickup && userPosition) {
         setOrigin({
           lat: userPosition[0],
           lng: userPosition[1],
           name: 'My Location'
         });
      }

      setDestination(selectedItem);
      setAppMode(APP_MODES.PLANNING);
      setBottomSheet(SHEET_STATES.HALF);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setFocusedField(null);
    }
  };

  const showDropdown = focusedField && (suggestions.length > 0 || isLoading);

  return (
    <div className="search-bar-container" ref={wrapperRef} style={{ position: 'relative' }}>
      <div className={`search-panel-wrapper ${focusedField ? 'focused' : ''}`}>
        
        {/* ── Pickup Row ── */}
        <div className={`search-row ${focusedField === 'pickup' ? 'active-row' : ''}`}>
          <span className="search-icon" aria-hidden="true">
            <Crosshair size={18} strokeWidth={2.2} />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Pickup Location"
            value={pickupQuery}
            onChange={(e) => {
              setPickupQuery(e.target.value);
              setHasUserEditedPickup(true);
              if (appMode === APP_MODES.PLANNING) setAppMode(APP_MODES.SEARCHING);
            }}
            onFocus={() => handleFocus('pickup')}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {pickupQuery && focusedField === 'pickup' && (
            <button
              className="search-clear-btn"
              onClick={() => handleClear('pickup')}
              aria-label="Clear pickup"
              tabIndex={0}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="search-divider-horizontal" />
        
        {/* ── SWAP BUTTON ── */}
        <button 
          className="search-swap-btn" 
          onClick={handleSwap} 
          aria-label="Swap pickup and destination"
          title="Swap locations"
        >
          <ArrowUpDown size={16} strokeWidth={2} />
        </button>

        {/* ── Destination Row ── */}
        <div className={`search-row ${focusedField === 'dest' ? 'active-row' : ''}`}>
          <span className="search-icon" aria-hidden="true">
            <Search size={18} strokeWidth={2.2} />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Where do you want to go?"
            value={destQuery}
            onChange={(e) => {
              setDestQuery(e.target.value);
              if (appMode === APP_MODES.PLANNING) setAppMode(APP_MODES.SEARCHING);
            }}
            onFocus={() => handleFocus('dest')}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {destQuery && focusedField === 'dest' && (
            <button
              className="search-clear-btn"
              onClick={() => handleClear('dest')}
              aria-label="Clear destination"
              tabIndex={0}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

      </div>

      {showDropdown && (
        <SearchSuggestions 
          suggestions={suggestions} 
          activeIndex={activeIndex} 
          onSelect={handleSelect} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default SearchBar;
