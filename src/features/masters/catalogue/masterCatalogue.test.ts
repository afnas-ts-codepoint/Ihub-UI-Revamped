import { describe, expect, it } from 'vitest';

import arNav from '@/shared/i18n/locales/ar/nav.json';
import enNav from '@/shared/i18n/locales/en/nav.json';

import { ADMIN_MASTER_CATALOG, findAdminMaster } from './masterCatalogue';

const expectedLabels = [
  'Project Category Master',
  'Action Sheet Approval Workflow',
  'Brand',
  'Budget Approval Workflow',
  'Budgeting Entry Template',
  'Case Category',
  'Checklist Comments',
  'Common Verify/Approve Workflow',
  'Configuration',
  'Cron Job Settings',
  'Holiday Master',
  'Loan Approval Workflow',
  'Observations',
  'Payment Method',
  'Payment Mode',
  'PC Request Workflow',
  'Petty Cash Stage',
  'Petty Cash Stage Workflow',
  'Projected Revenue Modify',
  'Projecting Budget Modify',
  'Quality Assurance Fill Workflow',
  'Question Category',
  'Ride Category',
  'Role Privileges',
  'User Privileges',
  'Users',
  'View Permitted Users',
] as const;

describe('Admin master catalogue checkpoint', () => {
  it('contains the 27 prototype entries in source order', () => {
    expect(ADMIN_MASTER_CATALOG).toHaveLength(27);
    expect(
      ADMIN_MASTER_CATALOG.map((entry) => enNav.masters.items[entry.slug]),
    ).toEqual(expectedLabels);
  });

  it('keeps generated prototype ids, slugs and both route variants aligned', () => {
    for (const entry of ADMIN_MASTER_CATALOG) {
      expect(entry.prototypeId).toBe(`masters/admin/${entry.slug}`);
      expect(entry.prototypeListId).toBe(`masters-list/admin/${entry.slug}`);
      expect(entry.path).toBe(`/masters/admin/${entry.slug}`);
      expect(entry.listPath).toBe(`/masters-list/admin/${entry.slug}`);
      expect(findAdminMaster('admin', entry.slug)).toBe(entry);
    }

    expect(findAdminMaster('general', 'machine-master')).toBeUndefined();
  });

  it('preserves the prototype Arabic fallback for item labels', () => {
    for (const entry of ADMIN_MASTER_CATALOG) {
      const key = entry.slug;
      expect(arNav.masters.items[key]).toBe(enNav.masters.items[key]);
    }

    expect(arNav.masters.categories.admin).toBe('الإدارة');
  });

  it('classifies the one built screen as pending and 26 screenless items as placeholders', () => {
    expect(
      ADMIN_MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'migration-pending',
      ).map((entry) => entry.slug),
    ).toEqual(['project-category-master']);
    expect(
      ADMIN_MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'placeholder',
      ),
    ).toHaveLength(26);
  });
});
