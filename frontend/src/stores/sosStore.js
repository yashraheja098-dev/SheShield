/**
 * sosStore — SOS emergency state machine.
 *
 * Flow:
 *   User taps SOS → beginCountdown() → 5-second countdown
 *   → if not cancelled → activateSOS() → contacts alerted
 *   → resolveEmergency() resets all state
 */
import { create } from 'zustand';

const useSosStore = create((set, get) => ({
  /* ── State ── */
  isActive:         false,
  isCountingDown:   false,
  countdown:        5,
  contactsAlerted:  [],
  triggeredAt:      null,
  activeSosId:      null,   /* backend SOSLog._id — stored for resolve call */
  _timerId:         null,   /* internal — do not read directly */

  /* ── Begin countdown (5 → 0, then auto-trigger) ── */
  beginCountdown: () => {
    const { _timerId } = get();
    if (_timerId) clearInterval(_timerId); // Guard: no double timers

    const id = setInterval(() => {
      const { countdown } = get();
      if (countdown <= 1) {
        clearInterval(get()._timerId);
        set({
          isCountingDown: false,
          isActive:       true,
          countdown:      5,
          triggeredAt:    Date.now(),
          _timerId:       null,
        });
      } else {
        set({ countdown: countdown - 1 });
      }
    }, 1000);

    set({ isCountingDown: true, countdown: 5, _timerId: id });
  },

  /* ── Cancel before it fires ── */
  cancelCountdown: () => {
    const { _timerId } = get();
    if (_timerId) clearInterval(_timerId);
    set({ isCountingDown: false, countdown: 5, _timerId: null });
  },

  /* ── Mark contacts as alerted ── */
  alertContacts: (contacts) => set({ contactsAlerted: contacts }),

  /* ── Store SOS log ID returned from backend ── */
  setActiveSosId: (id) => set({ activeSosId: id }),

  /* ── User resolves the emergency ── */
  resolveEmergency: () => {
    const { _timerId } = get();
    if (_timerId) clearInterval(_timerId);
    set({
      isActive:        false,
      isCountingDown:  false,
      countdown:       5,
      contactsAlerted: [],
      triggeredAt:     null,
      activeSosId:     null,
      _timerId:        null,
    });
  },
}));

export default useSosStore;
