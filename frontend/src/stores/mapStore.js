/**
 * mapStore — Owns the Leaflet map instance and camera state.
 *
 * Why store mapInstance in Zustand:
 * Allows any component (e.g., SOS button → "fly to safe point")
 * to trigger map movements without prop drilling.
 */
import { create } from 'zustand';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FLY_DURATION_SECONDS } from '../constants/mapConstants';

const useMapStore = create((set, get) => ({
  /* ── State ── */
  center:      DEFAULT_CENTER,
  zoom:        DEFAULT_ZOOM,
  mapInstance: null,
  isMapReady:  false,

  /* ── Actions ── */
  setCenter: (center) => set({ center }),
  setZoom:   (zoom)   => set({ zoom }),

  setMapInstance: (instance) =>
    set({ mapInstance: instance, isMapReady: !!instance }),

  /** Smooth animated fly to a latlng position */
  flyTo: (latlng, zoom) => {
    const { mapInstance } = get();
    if (!mapInstance) return;
    mapInstance.flyTo(latlng, zoom ?? DEFAULT_ZOOM, {
      animate: true,
      duration: FLY_DURATION_SECONDS,
    });
  },

  /** Instant pan without zoom change */
  panTo: (latlng) => {
    const { mapInstance } = get();
    if (!mapInstance) return;
    mapInstance.panTo(latlng, { animate: true, duration: 0.4 });
  },
}));

export default useMapStore;
