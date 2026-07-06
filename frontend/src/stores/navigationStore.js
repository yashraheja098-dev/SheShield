/**
 * navigationStore — Active navigation and user position tracking.
 * userPosition is the single source of truth for the device's location.
 */
import { create } from 'zustand';

const useNavigationStore = create((set, get) => ({
  /* ── State ── */
  userPosition:      null,   /* [lat, lng] | null       */
  heading:           0,      /* compass degrees          */
  isNavigating:      false,
  steps:             [],     /* NavigationStep[]         */
  currentStepIndex:  0,
  remainingDistance: 0,      /* meters                   */
  remainingTime:     0,      /* seconds                  */
  hasDeviated:       false,
  deviationDistance: 0,      /* meters off-route         */
  activeJourneyId:   null,   /* backend Journey._id      */

  /* ── Position ── */
  updatePosition: (latlng) => set({ userPosition: latlng }),
  setHeading:     (deg)    => set({ heading: deg }),
  setActiveJourneyId: (id) => set({ activeJourneyId: id }),

  /* ── Navigation Lifecycle ── */
  startNavigation: (steps) =>
    set({
      isNavigating:     true,
      steps,
      currentStepIndex: 0,
      hasDeviated:      false,
      deviationDistance:0,
    }),

  stopNavigation: () =>
    set({
      isNavigating:     false,
      steps:            [],
      currentStepIndex: 0,
      hasDeviated:      false,
      deviationDistance:0,
      activeJourneyId:  null,
    }),

  nextStep: () =>
    set((s) => ({
      currentStepIndex: Math.min(s.currentStepIndex + 1, s.steps.length - 1),
    })),

  updateETA: (distance, time) =>
    set({ remainingDistance: distance, remainingTime: time }),

  /* ── Deviation ── */
  triggerDeviation: (distance) =>
    set({ hasDeviated: true, deviationDistance: distance }),

  clearDeviation: () =>
    set({ hasDeviated: false, deviationDistance: 0 }),
}));

export default useNavigationStore;
