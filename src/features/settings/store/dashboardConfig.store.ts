import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

import { DASHBOARD_IDS } from '../types/dashboardConfig.types';
import type {
  DashboardConfig,
  DashboardId,
  SavedConfigEntry,
} from '../types/dashboardConfig.types';

export const dashboardConfigStorageKey = 'ihub.v2.settings.dashboardConfig';

type ScopedConfigs = Record<string, DashboardConfig>;

type PersistedShape = {
  adminConfigsByDashboard: Partial<Record<DashboardId, ScopedConfigs>>;
  adminLibraryByDashboard: Partial<Record<DashboardId, readonly SavedConfigEntry[]>>;
  lastSelectedAdminDashboard: DashboardId;
  lastSelectedUserDashboard: DashboardId;
  personalConfigByDashboard: Partial<Record<DashboardId, DashboardConfig>>;
  personalLibraryByDashboard: Partial<Record<DashboardId, readonly SavedConfigEntry[]>>;
};

type DashboardConfigState = PersistedShape & {
  removeAdminScopedConfig: (dashboardId: DashboardId, scopeKey: string) => void;
  setAdminLibrary: (dashboardId: DashboardId, entries: readonly SavedConfigEntry[]) => void;
  setAdminScopedConfig: (
    dashboardId: DashboardId,
    scopeKey: string,
    config: DashboardConfig,
  ) => void;
  setLastSelectedAdminDashboard: (dashboardId: DashboardId) => void;
  setLastSelectedUserDashboard: (dashboardId: DashboardId) => void;
  setPersonalConfig: (dashboardId: DashboardId, config: DashboardConfig | null) => void;
  setPersonalLibrary: (dashboardId: DashboardId, entries: readonly SavedConfigEntry[]) => void;
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
      // Dashboard configuration remains usable in memory when storage is unavailable.
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Dashboard configuration remains usable in memory when storage is unavailable.
    }
  },
};

function isDashboardId(value: unknown): value is DashboardId {
  return (DASHBOARD_IDS as readonly string[]).includes(value as string);
}

function isDashboardConfig(value: unknown): value is DashboardConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { ids?: unknown }).ids)
  );
}

function isSavedConfigEntryArray(value: unknown): value is readonly SavedConfigEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as { id?: unknown }).id === 'string' &&
        isDashboardConfig((entry as { cfg?: unknown }).cfg),
    )
  );
}

function sanitizeScopedConfigs(value: unknown): ScopedConfigs {
  if (typeof value !== 'object' || value === null) return {};
  const result: ScopedConfigs = {};
  for (const [key, config] of Object.entries(value)) {
    if (isDashboardConfig(config)) result[key] = config;
  }
  return result;
}

function sanitizeByDashboard<T>(
  value: unknown,
  isValid: (candidate: unknown) => candidate is T,
): Partial<Record<DashboardId, T>> {
  if (typeof value !== 'object' || value === null) return {};
  const result: Partial<Record<DashboardId, T>> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (isDashboardId(key) && isValid(candidate)) result[key] = candidate;
  }
  return result;
}

function mergePersistedDashboardConfig(
  persisted: unknown,
  current: DashboardConfigState,
): DashboardConfigState {
  if (!persisted || typeof persisted !== 'object') return current;
  const candidate = persisted as Record<string, unknown>;

  return {
    ...current,
    adminConfigsByDashboard: sanitizeByDashboard(
      candidate.adminConfigsByDashboard,
      (value): value is ScopedConfigs =>
        typeof value === 'object' && value !== null,
    ),
    adminLibraryByDashboard: sanitizeByDashboard(
      candidate.adminLibraryByDashboard,
      isSavedConfigEntryArray,
    ),
    lastSelectedAdminDashboard: isDashboardId(candidate.lastSelectedAdminDashboard)
      ? candidate.lastSelectedAdminDashboard
      : current.lastSelectedAdminDashboard,
    lastSelectedUserDashboard: isDashboardId(candidate.lastSelectedUserDashboard)
      ? candidate.lastSelectedUserDashboard
      : current.lastSelectedUserDashboard,
    personalConfigByDashboard: sanitizeByDashboard(
      candidate.personalConfigByDashboard,
      isDashboardConfig,
    ),
    personalLibraryByDashboard: sanitizeByDashboard(
      candidate.personalLibraryByDashboard,
      isSavedConfigEntryArray,
    ),
  };
}

/**
 * Persists per-dashboard admin scoped configs + saved-configuration
 * library, and the personal (User Configuration) override + its own
 * library, one entry per dashboard for each. Mirrors the prototype's
 * several `localStorage` keys in behavior and granularity (not their
 * literal key strings): each dashboard has its own scoped-config map
 * (default/role/dept/user overrides) and its own saved-configuration
 * library; a personal view has its own separate override and library, per
 * dashboard.
 */
export const useDashboardConfigStore = create<DashboardConfigState>()(
  persist(
    (set) => ({
      adminConfigsByDashboard: {},
      adminLibraryByDashboard: {},
      lastSelectedAdminDashboard: 'tasks',
      lastSelectedUserDashboard: 'tasks',
      personalConfigByDashboard: {},
      personalLibraryByDashboard: {},

      removeAdminScopedConfig: (dashboardId, scopeKey) => {
        set((state) => {
          const existing = sanitizeScopedConfigs(
            state.adminConfigsByDashboard[dashboardId],
          );
          const rest = Object.fromEntries(
            Object.entries(existing).filter(([entryKey]) => entryKey !== scopeKey),
          );
          return {
            adminConfigsByDashboard: {
              ...state.adminConfigsByDashboard,
              [dashboardId]: rest,
            },
          };
        });
      },
      setAdminLibrary: (dashboardId, entries) => {
        set((state) => ({
          adminLibraryByDashboard: {
            ...state.adminLibraryByDashboard,
            [dashboardId]: entries,
          },
        }));
      },
      setAdminScopedConfig: (dashboardId, scopeKey, config) => {
        set((state) => ({
          adminConfigsByDashboard: {
            ...state.adminConfigsByDashboard,
            [dashboardId]: {
              ...state.adminConfigsByDashboard[dashboardId],
              [scopeKey]: config,
            },
          },
        }));
      },
      setLastSelectedAdminDashboard: (dashboardId) => {
        set({ lastSelectedAdminDashboard: dashboardId });
      },
      setLastSelectedUserDashboard: (dashboardId) => {
        set({ lastSelectedUserDashboard: dashboardId });
      },
      setPersonalConfig: (dashboardId, config) => {
        set((state) => {
          if (config === null) {
            const rest = Object.fromEntries(
              Object.entries(state.personalConfigByDashboard).filter(
                ([entryKey]) => entryKey !== dashboardId,
              ),
            );
            return { personalConfigByDashboard: rest };
          }
          return {
            personalConfigByDashboard: {
              ...state.personalConfigByDashboard,
              [dashboardId]: config,
            },
          };
        });
      },
      setPersonalLibrary: (dashboardId, entries) => {
        set((state) => ({
          personalLibraryByDashboard: {
            ...state.personalLibraryByDashboard,
            [dashboardId]: entries,
          },
        }));
      },
    }),
    {
      merge: mergePersistedDashboardConfig,
      name: dashboardConfigStorageKey,
      partialize: (state) => ({
        adminConfigsByDashboard: state.adminConfigsByDashboard,
        adminLibraryByDashboard: state.adminLibraryByDashboard,
        lastSelectedAdminDashboard: state.lastSelectedAdminDashboard,
        lastSelectedUserDashboard: state.lastSelectedUserDashboard,
        personalConfigByDashboard: state.personalConfigByDashboard,
        personalLibraryByDashboard: state.personalLibraryByDashboard,
      }),
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
