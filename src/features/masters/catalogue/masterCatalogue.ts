import { paths } from '@/shared/config/paths';

type MasterRouteBehavior = 'migration-pending' | 'placeholder';

const adminItems = [
  ['project-category-master', 'migration-pending'],
  ['action-sheet-approval-workflow', 'placeholder'],
  ['brand', 'placeholder'],
  ['budget-approval-workflow', 'placeholder'],
  ['budgeting-entry-template', 'placeholder'],
  ['case-category', 'placeholder'],
  ['checklist-comments', 'placeholder'],
  ['common-verify-approve-workflow', 'placeholder'],
  ['configuration', 'placeholder'],
  ['cron-job-settings', 'placeholder'],
  ['holiday-master', 'placeholder'],
  ['loan-approval-workflow', 'placeholder'],
  ['observations', 'placeholder'],
  ['payment-method', 'placeholder'],
  ['payment-mode', 'placeholder'],
  ['pc-request-workflow', 'placeholder'],
  ['petty-cash-stage', 'placeholder'],
  ['petty-cash-stage-workflow', 'placeholder'],
  ['projected-revenue-modify', 'placeholder'],
  ['projecting-budget-modify', 'placeholder'],
  ['quality-assurance-fill-workflow', 'placeholder'],
  ['question-category', 'placeholder'],
  ['ride-category', 'placeholder'],
  ['role-privileges', 'placeholder'],
  ['user-privileges', 'placeholder'],
  ['users', 'placeholder'],
  ['view-permitted-users', 'placeholder'],
] as const satisfies readonly (readonly [string, MasterRouteBehavior])[];

const generalItems = [
  ['machine-master', 'migration-pending'],
  ['asset-category', 'placeholder'],
  ['budget-activities', 'placeholder'],
  ['currency-exchange', 'placeholder'],
  ['departments', 'placeholder'],
  ['dependency-category-master', 'placeholder'],
  ['dependency-type-master', 'placeholder'],
  ['designations', 'placeholder'],
  ['escalation-master', 'placeholder'],
  ['guest-satisfaction-master', 'placeholder'],
  ['impacted-area-master', 'placeholder'],
  ['locations', 'placeholder'],
  ['project-category', 'placeholder'],
  ['project-master', 'placeholder'],
  ['revenue-stream', 'placeholder'],
  ['risk-impacted-category-master', 'placeholder'],
  ['roles', 'placeholder'],
  ['suppliers', 'placeholder'],
  ['task-category', 'placeholder'],
  ['task-type', 'placeholder'],
  ['touch-point', 'placeholder'],
  ['zones', 'placeholder'],
] as const satisfies readonly (readonly [string, MasterRouteBehavior])[];

const hrItems = [
  ['appraisal-deduction', 'placeholder'],
  ['appraisal-frequency', 'placeholder'],
  ['appraiser-questions', 'placeholder'],
  ['appraisal-section-name', 'placeholder'],
  ['appraiser-mapping', 'placeholder'],
  ['average-day-sales', 'placeholder'],
  ['crises-level', 'placeholder'],
  ['employees', 'placeholder'],
  ['employees-category-type', 'placeholder'],
  ['employees-jobs', 'placeholder'],
  ['employees-ops-category', 'placeholder'],
  ['employees-overall-category', 'placeholder'],
  ['overtime-calculation', 'placeholder'],
  ['quality-assurance-type', 'placeholder'],
  ['standard-headcount', 'placeholder'],
  ['violation-policy', 'placeholder'],
] as const satisfies readonly (readonly [string, MasterRouteBehavior])[];

const operationItems = [
  ['assignment-areas', 'migration-pending'],
  ['task-mapping', 'migration-pending'],
  ['sub-area', 'migration-pending'],
  ['area', 'placeholder'],
  ['area-mapping', 'placeholder'],
  ['area-settings', 'placeholder'],
  ['item-concept-name', 'placeholder'],
  ['item-main-group', 'placeholder'],
  ['item-master', 'placeholder'],
  ['item-pos-system', 'placeholder'],
  ['item-reporting-category', 'placeholder'],
  ['item-sub-group-one', 'placeholder'],
  ['item-sub-group-two', 'placeholder'],
  ['item-type-name', 'placeholder'],
  ['item-unit', 'placeholder'],
] as const satisfies readonly (readonly [string, MasterRouteBehavior])[];

type MasterCategory = 'admin' | 'general' | 'hr' | 'operation';
type AdminMasterSlug = (typeof adminItems)[number][0];
type GeneralMasterSlug = (typeof generalItems)[number][0];
type HrMasterSlug = (typeof hrItems)[number][0];
type OperationMasterSlug = (typeof operationItems)[number][0];
type MasterSlug =
  AdminMasterSlug | GeneralMasterSlug | HrMasterSlug | OperationMasterSlug;

type MasterCatalogEntry = Readonly<{
  prototypeId: `masters/${MasterCategory}/${MasterSlug}`;
  prototypeListId: `masters-list/${MasterCategory}/${MasterSlug}`;
  category: MasterCategory;
  slug: MasterSlug;
  labelKey: `masters.items.${MasterSlug}`;
  path: `/masters/${MasterCategory}/${MasterSlug}`;
  listPath: `/masters-list/${MasterCategory}/${MasterSlug}`;
  routeBehavior: MasterRouteBehavior;
}>;

function masterEntry(
  category: MasterCategory,
  slug: MasterSlug,
  routeBehavior: MasterRouteBehavior,
): MasterCatalogEntry {
  return {
    prototypeId: `masters/${category}/${slug}`,
    prototypeListId: `masters-list/${category}/${slug}`,
    category,
    slug,
    labelKey: `masters.items.${slug}`,
    path: paths.masters.item(category, slug),
    listPath: paths.mastersList.item(category, slug),
    routeBehavior,
  };
}

/** Prototype `MASTERS_CATEGORIES` Admin branch, index.html:2423-2433. */
export const ADMIN_MASTER_CATALOG = adminItems.map(([slug, routeBehavior]) =>
  masterEntry('admin', slug, routeBehavior),
);

/** Prototype `MASTERS_CATEGORIES` General branch, index.html:2434-2441. */
export const GENERAL_MASTER_CATALOG = generalItems.map(
  ([slug, routeBehavior]) => masterEntry('general', slug, routeBehavior),
);

/** Prototype `MASTERS_CATEGORIES` HR branch, index.html:2442-2448. */
export const HR_MASTER_CATALOG = hrItems.map(([slug, routeBehavior]) =>
  masterEntry('hr', slug, routeBehavior),
);

/** Prototype `MASTERS_CATEGORIES` Operation branch, index.html:2449-2455. */
export const OPERATION_MASTER_CATALOG = operationItems.map(
  ([slug, routeBehavior]) => masterEntry('operation', slug, routeBehavior),
);

export const MASTER_CATALOG = [
  ...ADMIN_MASTER_CATALOG,
  ...GENERAL_MASTER_CATALOG,
  ...HR_MASTER_CATALOG,
  ...OPERATION_MASTER_CATALOG,
];

export function findMaster(
  category: string | undefined,
  slug: string | undefined,
): MasterCatalogEntry | undefined {
  return MASTER_CATALOG.find(
    (entry) => entry.category === category && entry.slug === slug,
  );
}
