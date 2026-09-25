import { describe, expect, it } from 'vitest';

import arNav from '@/shared/i18n/locales/ar/nav.json';
import enNav from '@/shared/i18n/locales/en/nav.json';

import {
  ADMIN_MASTER_CATALOG,
  findMaster,
  GENERAL_MASTER_CATALOG,
  HR_MASTER_CATALOG,
  MASTER_CATALOG,
  OPERATION_MASTER_CATALOG,
} from './masterCatalogue';

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

const expectedGeneralLabels = [
  'Machine Master',
  'Asset Category',
  'Budget Activities',
  'Currency Exchange',
  'Departments',
  'Dependency Category Master',
  'Dependency Type Master',
  'Designations',
  'Escalation Master',
  'Guest Satisfaction Master',
  'Impacted Area Master',
  'Locations',
  'Project Category',
  'Project Master',
  'Revenue Stream',
  'Risk / Impacted Category Master',
  'Roles',
  'Suppliers',
  'Task Category',
  'Task Type',
  'Touch Point',
  'Zones',
] as const;

const expectedHrLabels = [
  'Appraisal Deduction',
  'Appraisal Frequency',
  'Appraiser Questions',
  'Appraisal Section Name',
  'Appraiser Mapping',
  'Average Day Sales',
  'Crises Level',
  'Employees',
  'Employees Category Type',
  'Employees Jobs',
  'Employees OPS Category',
  'Employees Overall Category',
  'Overtime Calculation',
  'Quality Assurance Type',
  'Standard Headcount',
  'Violation Policy',
] as const;

const expectedOperationLabels = [
  'Assignment Areas',
  'Task Mapping',
  'Sub Area',
  'Area',
  'Area Mapping',
  'Area Settings',
  'Item Concept Name',
  'Item Main Group',
  'Item Master',
  'Item Pos System',
  'Item Reporting Category',
  'Item Sub Group One',
  'Item Sub Group Two',
  'Item Type Name',
  'Item Unit',
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
      expect(findMaster('admin', entry.slug)).toBe(entry);
    }

    expect(findMaster('admin', 'machine-master')).toBeUndefined();
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

describe('General master catalogue checkpoint', () => {
  it('contains the 22 prototype entries in source order', () => {
    expect(GENERAL_MASTER_CATALOG).toHaveLength(22);
    expect(
      GENERAL_MASTER_CATALOG.map((entry) => enNav.masters.items[entry.slug]),
    ).toEqual(expectedGeneralLabels);
  });

  it('keeps generated prototype ids, slugs and both route variants aligned', () => {
    for (const entry of GENERAL_MASTER_CATALOG) {
      expect(entry.prototypeId).toBe(`masters/general/${entry.slug}`);
      expect(entry.prototypeListId).toBe(`masters-list/general/${entry.slug}`);
      expect(entry.path).toBe(`/masters/general/${entry.slug}`);
      expect(entry.listPath).toBe(`/masters-list/general/${entry.slug}`);
      expect(findMaster('general', entry.slug)).toBe(entry);
    }

    expect(findMaster('general', 'assignment-areas')).toBeUndefined();
  });

  it('preserves the prototype Arabic fallback for item labels', () => {
    for (const entry of GENERAL_MASTER_CATALOG) {
      const key = entry.slug;
      expect(arNav.masters.items[key]).toBe(enNav.masters.items[key]);
    }

    expect(arNav.masters.categories.general).toBe('عام');
  });

  it('classifies Machine Master as pending and 21 screenless items as placeholders', () => {
    expect(
      GENERAL_MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'migration-pending',
      ).map((entry) => entry.slug),
    ).toEqual(['machine-master']);
    expect(
      GENERAL_MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'placeholder',
      ),
    ).toHaveLength(21);
  });
});

describe('HR master catalogue checkpoint', () => {
  it('contains the 16 prototype entries in source order', () => {
    expect(HR_MASTER_CATALOG).toHaveLength(16);
    expect(
      HR_MASTER_CATALOG.map((entry) => enNav.masters.items[entry.slug]),
    ).toEqual(expectedHrLabels);
  });

  it('keeps ids, routes and prototype Arabic fallback aligned', () => {
    for (const entry of HR_MASTER_CATALOG) {
      expect(entry.prototypeId).toBe(`masters/hr/${entry.slug}`);
      expect(entry.prototypeListId).toBe(`masters-list/hr/${entry.slug}`);
      expect(entry.path).toBe(`/masters/hr/${entry.slug}`);
      expect(entry.listPath).toBe(`/masters-list/hr/${entry.slug}`);
      expect(findMaster('hr', entry.slug)).toBe(entry);
      expect(arNav.masters.items[entry.slug]).toBe(
        enNav.masters.items[entry.slug],
      );
    }

    expect(arNav.masters.categories.hr).toBe('الموارد البشرية');
  });

  it('classifies all 16 screenless items as placeholders', () => {
    expect(
      HR_MASTER_CATALOG.every((entry) => entry.routeBehavior === 'placeholder'),
    ).toBe(true);
  });
});

describe('Operation master catalogue checkpoint', () => {
  it('contains the 15 prototype entries in source order', () => {
    expect(OPERATION_MASTER_CATALOG).toHaveLength(15);
    expect(
      OPERATION_MASTER_CATALOG.map((entry) => enNav.masters.items[entry.slug]),
    ).toEqual(expectedOperationLabels);
  });

  it('keeps ids, routes and prototype Arabic fallback aligned', () => {
    for (const entry of OPERATION_MASTER_CATALOG) {
      expect(entry.prototypeId).toBe(`masters/operation/${entry.slug}`);
      expect(entry.prototypeListId).toBe(
        `masters-list/operation/${entry.slug}`,
      );
      expect(entry.path).toBe(`/masters/operation/${entry.slug}`);
      expect(entry.listPath).toBe(`/masters-list/operation/${entry.slug}`);
      expect(findMaster('operation', entry.slug)).toBe(entry);
      expect(arNav.masters.items[entry.slug]).toBe(
        enNav.masters.items[entry.slug],
      );
    }

    expect(arNav.masters.categories.operation).toBe('العمليات');
  });

  it('classifies three built screens as pending and 12 screenless items as placeholders', () => {
    expect(
      OPERATION_MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'migration-pending',
      ).map((entry) => entry.slug),
    ).toEqual(['assignment-areas', 'task-mapping', 'sub-area']);
    expect(
      OPERATION_MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'placeholder',
      ),
    ).toHaveLength(12);
  });
});

describe('complete Masters catalogue', () => {
  it('contains exactly 80 unique prototype entries', () => {
    expect(MASTER_CATALOG).toHaveLength(80);
    expect(new Set(MASTER_CATALOG.map((entry) => entry.prototypeId)).size).toBe(
      80,
    );
    expect(new Set(MASTER_CATALOG.map((entry) => entry.path)).size).toBe(80);
    expect(
      MASTER_CATALOG.filter(
        (entry) => entry.routeBehavior === 'migration-pending',
      ),
    ).toHaveLength(5);
    expect(
      MASTER_CATALOG.filter((entry) => entry.routeBehavior === 'placeholder'),
    ).toHaveLength(75);
  });
});
