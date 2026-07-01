/**
 * routeStore — Owns the route planning state.
 * Origin, destination, fetched routes, and active selection.
 */
import { create } from 'zustand';

const useRouteStore = create((set) => ({
  /* ── State ── */
  origin:           null,   /* { name, lat, lng } */
  destination:      null,   /* { name, lat, lng } */
  routes:           [],     /* RouteOption[]       */
  activeRouteIndex: 0,
  isLoading:        false,
  error:            null,

  /* ── Actions ── */
  setOrigin:      (origin)      => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setRoutes:      (routes)      => set({ routes, activeRouteIndex: 0, isLoading: false, error: null }),
  setActiveRoute: (index)       => set({ activeRouteIndex: index }),
  setLoading:     (isLoading)   => set({ isLoading }),
  setError:       (error)       => set({ error, isLoading: false }),

  clearRoute: () =>
    set({
      origin: null,
      destination: null,
      routes: [],
      activeRouteIndex: 0,
      isLoading: false,
      error: null,
    }),
}));

export default useRouteStore;
