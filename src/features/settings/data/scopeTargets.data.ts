import type { DashboardUser } from '../types/dashboardConfig.types';

/**
 * Role scope targets. A literal separate from any other role list in the
 * app (`ROLES`) — plain, untranslated strings in the prototype.
 * @prototype index.html:L7171
 */
export const DASHBOARD_ROLES: readonly string[] = [
  'Duty Manager',
  'Project Manager',
  'Department Head',
  'Facilities Supervisor',
  'Safety Officer',
  'Finance Analyst',
  'Marketing Lead',
];

/**
 * Individual-user scope targets (`USERS`). A separate literal from any other
 * user/assignee fixture in the app (e.g. not the task-assignee list) —
 * plain English strings, no Arabic variants, matching the prototype
 * exactly. Shaped loosely like `current-user.mock.ts`'s `{id, name}` for
 * consistency, but names stay untranslated plain strings.
 * @prototype index.html:L7172
 */
export const DASHBOARD_USERS: readonly DashboardUser[] = [
  { id: 'm-faris', name: 'M. Faris' },
  { id: 's-al-qahtani', name: 'S. Al-Qahtani' },
  { id: 'o-najjar', name: 'O. Najjar' },
  { id: 'r-salem', name: 'R. Salem' },
  { id: 'l-haddad', name: 'L. Haddad' },
  { id: 'k-ibrahim', name: 'K. Ibrahim' },
  { id: 'h-al-mutairi', name: 'H. Al-Mutairi' },
  { id: 'alex-morgan', name: 'Alex Morgan' },
  { id: 'sarah-connor', name: 'Sarah Connor' },
  { id: 'bruce-wayne', name: 'Bruce Wayne' },
];

export const DASHBOARD_USER_NAMES: readonly string[] = DASHBOARD_USERS.map(
  (user) => user.name,
);
