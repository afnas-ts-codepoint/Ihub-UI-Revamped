import type { SavedConfigEntry } from '../types/dashboardConfig.types';

/**
 * The saved-configuration library seed. Populated ONLY for the Task Manager
 * dashboard's Admin Configuration view — every other dashboard, and every
 * User Configuration view, starts with an empty library, matching the
 * prototype's `SEED_LIB` (`U ? [] : !LIVE ? (DEF.seedLib || []) : [...]`).
 * Fixture text (`name`, `applied`, `by`) is plain hardcoded English in the
 * prototype with no Arabic counterpart — preserved verbatim, untranslated.
 * @prototype index.html:L7177-L7182
 */
export const TASK_DASHBOARD_SEED_LIBRARY: readonly SavedConfigEntry[] = [
  {
    applied: 'Management team',
    by: 'Alex Morgan',
    cfg: {
      cols: 2,
      dnd: false,
      hide: false,
      ids: ['metrics', 'slaPerf', 'compliance', 'source', 'dependency', 'critical', 'impacted'],
      lock: true,
    },
    date: '2026-05-03',
    fav: true,
    id: 'L1',
    name: 'Executive dashboard',
    status: 'Active',
    uses: 24,
  },
  {
    applied: 'All project managers',
    by: 'Sarah Connor',
    cfg: {
      cols: 2,
      dnd: true,
      hide: true,
      ids: ['metrics', 'highPri', 'slaPerf', 'byDept', 'matrix', 'workload'],
      lock: false,
    },
    date: '2026-05-02',
    fav: true,
    id: 'L2',
    name: 'PM standard view',
    status: 'Active',
    uses: 18,
  },
  {
    applied: 'Finance department',
    by: 'Bruce Wayne',
    cfg: {
      cols: 2,
      dnd: true,
      hide: true,
      ids: ['metrics', 'byDept', 'matrix', 'compliance', 'source', 'dependency'],
      lock: false,
    },
    date: '2026-04-28',
    fav: true,
    id: 'L3',
    name: 'Finance overview',
    status: 'Active',
    uses: 15,
  },
  {
    applied: 'Operations department',
    by: 'Alex Morgan',
    cfg: {
      cols: 1,
      dnd: true,
      hide: true,
      ids: ['critical', 'highPri', 'metrics', 'impacted', 'workload'],
      lock: false,
    },
    date: '2026-04-25',
    fav: false,
    id: 'L4',
    name: 'Operations dashboard',
    status: 'Draft',
    uses: 2,
  },
];

/** The fixed "current user" this builder authors saved configurations as. */
export const DASHBOARD_BUILDER_CURRENT_USER = 'Alex Morgan';
