import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export const taskDashboardConfigStorageKey = 'ihub.v2.taskdash.config';

export const TASK_DASHBOARD_WIDGET_IDS = [
  'metrics', 'slaPerf', 'compliance', 'source', 'dependency', 'highPri',
  'byDept', 'matrix', 'impacted', 'critical', 'workload',
] as const;
export type TaskDashboardWidgetId = (typeof TASK_DASHBOARD_WIDGET_IDS)[number];
export type TaskDashboardColumnCount = 1 | 2 | 3 | 4;
export type TaskDashboardConfig = Readonly<{
  cols: TaskDashboardColumnCount;
  dnd: boolean;
  hide: boolean;
  ids: readonly TaskDashboardWidgetId[];
  lock: boolean;
}>;

export const DEFAULT_TASK_DASHBOARD_CONFIG: TaskDashboardConfig = {
  cols: 2,
  dnd: true,
  hide: true,
  ids: TASK_DASHBOARD_WIDGET_IDS,
  lock: false,
};

type TaskDashboardConfigState = {
  organizationConfig: TaskDashboardConfig;
  personalConfig: TaskDashboardConfig | null;
  reset: () => void;
  setOrganizationConfig: (config: TaskDashboardConfig) => void;
  setPersonalConfig: (config: TaskDashboardConfig | null) => void;
};

const safeStorage: StateStorage = {
  getItem(name) { try { return localStorage.getItem(name); } catch { return null; } },
  removeItem(name) { try { localStorage.removeItem(name); } catch { /* memory fallback */ } },
  setItem(name, value) { try { localStorage.setItem(name, value); } catch { /* memory fallback */ } },
};

function isWidgetId(value: unknown): value is TaskDashboardWidgetId {
  return TASK_DASHBOARD_WIDGET_IDS.includes(value as TaskDashboardWidgetId);
}

function sanitizeConfig(value: unknown, fallback: TaskDashboardConfig): TaskDashboardConfig {
  if (typeof value !== 'object' || value === null || !Array.isArray((value as { ids?: unknown }).ids)) return fallback;
  const candidate = value as Partial<TaskDashboardConfig> & { ids: unknown[] };
  const ids = candidate.ids.filter(isWidgetId);
  const cols = [1, 2, 3, 4].includes(candidate.cols as number)
    ? candidate.cols as TaskDashboardColumnCount
    : fallback.cols;
  return {
    cols,
    dnd: typeof candidate.dnd === 'boolean' ? candidate.dnd : fallback.dnd,
    hide: typeof candidate.hide === 'boolean' ? candidate.hide : fallback.hide,
    ids,
    lock: typeof candidate.lock === 'boolean' ? candidate.lock : fallback.lock,
  };
}

export function effectiveTaskDashboardConfig(
  organizationConfig: TaskDashboardConfig,
  personalConfig: TaskDashboardConfig | null,
): TaskDashboardConfig {
  if (!personalConfig) return organizationConfig;
  let ids = personalConfig.ids.filter((id) => organizationConfig.ids.includes(id));
  if (!organizationConfig.hide) ids = ids.concat(organizationConfig.ids.filter((id) => !ids.includes(id)));
  if (!organizationConfig.dnd) ids = organizationConfig.ids.filter((id) => ids.includes(id));
  if (organizationConfig.lock) {
    const mandatory: readonly TaskDashboardWidgetId[] = ['metrics', 'slaPerf'];
    ids = mandatory
      .filter((id) => organizationConfig.ids.includes(id) && !ids.includes(id))
      .concat(ids);
  }
  return { ...organizationConfig, cols: personalConfig.cols, ids };
}

const initialState = { organizationConfig: DEFAULT_TASK_DASHBOARD_CONFIG, personalConfig: null } as const;

export const useTaskDashboardConfigStore = create<TaskDashboardConfigState>()(
  persist(
    (set) => ({
      ...initialState,
      reset: () => { set(initialState); },
      setOrganizationConfig: (organizationConfig) => { set({ organizationConfig }); },
      setPersonalConfig: (personalConfig) => { set({ personalConfig }); },
    }),
    {
      merge: (persisted, current) => {
        if (typeof persisted !== 'object' || persisted === null) return current;
        const value = persisted as Partial<TaskDashboardConfigState>;
        const organizationConfig = sanitizeConfig(value.organizationConfig, DEFAULT_TASK_DASHBOARD_CONFIG);
        return {
          ...current,
          organizationConfig,
          personalConfig: value.personalConfig === null || value.personalConfig === undefined
            ? null
            : sanitizeConfig(value.personalConfig, organizationConfig),
        };
      },
      name: taskDashboardConfigStorageKey,
      partialize: ({ organizationConfig, personalConfig }) => ({ organizationConfig, personalConfig }),
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
