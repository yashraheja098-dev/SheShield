/**
 * SearchBar — Floating glassmorphism search input.
 *
 * Phase 1: UI shell only (no autocomplete, no results).
 * Phase 2: wires search logic, suggestions dropdown, and map camera.
 */
import { useState } from 'react';
import { Search, X, Crosshair } from 'lucide-react';
import useUiStore from '../../../stores/uiStore';
import { APP_MODES } from '../../../constants/appConstants';
import './SearchBar.css';

const SearchBar = () => {
  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);

  const setAppMode = useUiStore((s) => s.setAppMode);

  const handleFocus = () => {
    setFocused(true);
    setAppMode(APP_MODES.SEARCHING);
  };

  const handleBlur = () => {
    setFocused(false);
    if (!query) setAppMode(APP_MODES.IDLE);
  };

  const handleClear = () => {
    setQuery('');
    setAppMode(APP_MODES.IDLE);
  };

  return (
    <div className={`search-bar-wrapper ${focused ? 'focused' : ''}`}>
      {/* ── Search Icon ── */}
      <span className="search-icon" aria-hidden="true">
        <Search size={18} strokeWidth={2.2} />
      </span>

      {/* ── Input ── */}
      <input
        id="she-search-input"
        type="text"
        className="search-input"
        placeholder="Where do you want to go?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        spellCheck={false}
        aria-label="Search destination"
      />

      {/* ── Clear Button (visible when query exists) ── */}
      {query && (
        <button
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
          tabIndex={0}
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Divider ── */}
      <span className="search-divider" aria-hidden="true" />

      {/* ── Locate Button ── */}
      <button
        className="search-locate-btn"
        aria-label="Use my location"
        tabIndex={0}
      >
        <Crosshair size={18} strokeWidth={2} />
      </button>
    </div>
  );
};

export default SearchBar;
