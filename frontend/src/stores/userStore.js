/**
 * userStore — User profile and trusted contacts.
 * Persisted to localStorage automatically.
 */
import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/appConstants';

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — fail silently
  }
};

const useUserStore = create((set, get) => ({
  /* ── State ── */
  profile:         load(STORAGE_KEYS.USER_PROFILE, null),
  trustedContacts: load(STORAGE_KEYS.TRUSTED_CONTACTS, []),
  isOnboarded:     !!localStorage.getItem(STORAGE_KEYS.ONBOARDED),
  token:           localStorage.getItem('ss_auth_token') || null,

  /* ── Token ── */
  setToken: (token) => {
    localStorage.setItem('ss_auth_token', token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem('ss_auth_token');
    set({ token: null, profile: null });
  },

  /* ── Profile ── */
  setProfile: (profile) => {
    save(STORAGE_KEYS.USER_PROFILE, profile);
    set({ profile });
  },

  /* ── Trusted Contacts ── */
  addContact: (contact) =>
    set((s) => {
      const contacts = [
        ...s.trustedContacts,
        { id: `contact_${Date.now()}`, ...contact },
      ];
      save(STORAGE_KEYS.TRUSTED_CONTACTS, contacts);
      return { trustedContacts: contacts };
    }),

  removeContact: (id) =>
    set((s) => {
      const contacts = s.trustedContacts.filter((c) => c.id !== id);
      save(STORAGE_KEYS.TRUSTED_CONTACTS, contacts);
      return { trustedContacts: contacts };
    }),

  updateContact: (id, updates) =>
    set((s) => {
      const contacts = s.trustedContacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      save(STORAGE_KEYS.TRUSTED_CONTACTS, contacts);
      return { trustedContacts: contacts };
    }),

  /* ── Onboarding ── */
  markOnboarded: () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    set({ isOnboarded: true });
  },
}));

export default useUserStore;
