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

type AdminMasterSlug = (typeof adminItems)[number][0];

type MasterCatalogEntry = Readonly<{
  prototypeId: `masters/admin/${AdminMasterSlug}`;
  prototypeListId: `masters-list/admin/${AdminMasterSlug}`;
  category: 'admin';
  slug: AdminMasterSlug;
  labelKey: `masters.items.${AdminMasterSlug}`;
  path: `/masters/admin/${AdminMasterSlug}`;
  listPath: `/masters-list/admin/${AdminMasterSlug}`;
  routeBehavior: MasterRouteBehavior;
}>;

/** Prototype `MASTERS_CATEGORIES` Admin branch, index.html:2423-2433. */
export const ADMIN_MASTER_CATALOG = adminItems.map(
  ([slug, routeBehavior]): MasterCatalogEntry => ({
    prototypeId: `masters/admin/${slug}`,
    prototypeListId: `masters-list/admin/${slug}`,
    category: 'admin',
    slug,
    labelKey: `masters.items.${slug}`,
    path: paths.masters.item('admin', slug),
    listPath: paths.mastersList.item('admin', slug),
    routeBehavior,
  }),
);

export function findAdminMaster(
  category: string | undefined,
  slug: string | undefined,
): MasterCatalogEntry | undefined {
  if (category !== 'admin') return undefined;
  return ADMIN_MASTER_CATALOG.find((entry) => entry.slug === slug);
}
