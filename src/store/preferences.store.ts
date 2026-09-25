import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

import { isLocale, type Locale } from '@/shared/i18n/i18n';

export const preferencesStorageKey = 'ihub.v2.preferences';

export type Theme = 'paper' | 'ink';

type PreferencesState = {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
};

const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch {
      // Preferences remain usable in memory when storage is unavailable.
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Preferences remain usable in memory when storage is unavailable.
    }
  },
};

function isTheme(value: unknown): value is Theme {
  return value === 'paper' || value === 'ink';
}

function mergePersistedPreferences(
  persisted: unknown,
  current: PreferencesState,
): PreferencesState {
  if (!persisted || typeof persisted !== 'object') {
    return current;
  }

  const candidate = persisted as Record<string, unknown>;

  return {
    ...current,
    locale: isLocale(candidate.locale) ? candidate.locale : current.locale,
    theme: isTheme(candidate.theme) ? candidate.theme : current.theme,
  };
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      theme: 'paper',
    }),
    {
      merge: mergePersistedPreferences,
      name: preferencesStorageKey,
      partialize: ({ locale, theme }) => ({ locale, theme }),
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
