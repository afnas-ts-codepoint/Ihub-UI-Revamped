import type { NavNode } from '@/app/navigation/types';
import {
  ADMIN_MASTER_CATALOG,
  GENERAL_MASTER_CATALOG,
  HR_MASTER_CATALOG,
  OPERATION_MASTER_CATALOG,
} from '@/features/masters';
import { paths } from '@/shared/config/paths';

const catalogues = {
  admin: ADMIN_MASTER_CATALOG,
  general: GENERAL_MASTER_CATALOG,
  hr: HR_MASTER_CATALOG,
  operation: OPERATION_MASTER_CATALOG,
} as const;

function masterCategory(
  category: keyof typeof catalogues,
  listVariant: boolean,
): NavNode {
  const idRoot = listVariant ? 'masters-list' : 'masters';
  const catalogue = catalogues[category];

  return {
    id: `${idRoot}/${category}`,
    labelKey: `masters.categories.${category}`,
    path: listVariant
      ? paths.mastersList.category(category)
      : paths.masters.category(category),
    children: catalogue.map((entry) => ({
      id: listVariant ? entry.prototypeListId : entry.prototypeId,
      labelKey: entry.labelKey,
      path: listVariant ? entry.listPath : entry.path,
    })),
  };
}

/** Complete 80-entry Masters catalogue subtree for both D10 variants. */
export const MASTERS_NAV = [
  {
    id: 'masters',
    labelKey: 'masters.title',
    path: paths.masters.root,
    icon: 'layers',
    megaMenu: true,
    children: [
      masterCategory('admin', false),
      masterCategory('general', false),
      masterCategory('hr', false),
      masterCategory('operation', false),
    ],
  },
  {
    id: 'masters-list',
    labelKey: 'masters.listTitle',
    path: paths.mastersList.root,
    icon: 'grid',
    firstLeafRoute: true,
    hideInTopNav: true,
    children: [
      masterCategory('admin', true),
      masterCategory('general', true),
      masterCategory('hr', true),
      masterCategory('operation', true),
    ],
  },
] as const satisfies readonly NavNode[];
