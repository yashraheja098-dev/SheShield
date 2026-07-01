/**
 * uiStore — Owns global UI layout state.
 * Controls app mode, bottom sheet snap, modals, and toast queue.
 */
import { create } from 'zustand';
import { APP_MODES, SHEET_STATES } from '../constants/appConstants';

const useUiStore = create((set, get) => ({
  /* ── State ── */
  appMode:          APP_MODES.IDLE,
  bottomSheetState: SHEET_STATES.PEEK,
  sidebarOpen:      false,
  activeModal:      null,  /* modal id string | null */
  toasts:           [],

  /* ── App Mode ── */
  setAppMode: (mode) => set({ appMode: mode }),

  /* ── Bottom Sheet ── */
  setBottomSheet: (state) => set({ bottomSheetState: state }),
  toggleBottomSheet: () =>
    set((s) => ({
      bottomSheetState:
        s.bottomSheetState === SHEET_STATES.PEEK
          ? SHEET_STATES.HALF
          : SHEET_STATES.PEEK,
    })),

  /* ── Sidebar ── */
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar:  () => set({ sidebarOpen: false }),

  /* ── Modals ── */
  openModal:  (id) => set({ activeModal: id }),
  closeModal: ()   => set({ activeModal: null }),

  /* ── Toast Queue ── */
  pushToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        {
          id:       Date.now(),
          type:     'info',   /* 'info' | 'success' | 'warning' | 'error' */
          duration: 3500,
          ...toast,
        },
      ],
    })),

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export default useUiStore;
