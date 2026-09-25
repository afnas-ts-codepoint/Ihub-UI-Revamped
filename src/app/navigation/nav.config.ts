import type { NavNode } from '@/app/navigation/types';
import { ADMIN_MASTER_CATALOG } from '@/features/masters';
import { paths } from '@/shared/config/paths';

function adminCategory(listVariant: boolean): NavNode {
  const idRoot = listVariant ? 'masters-list' : 'masters';

  return {
    id: `${idRoot}/admin`,
    labelKey: 'masters.categories.admin',
    path: listVariant
      ? paths.mastersList.category('admin')
      : paths.masters.category('admin'),
    children: ADMIN_MASTER_CATALOG.map((entry) => ({
      id: listVariant ? entry.prototypeListId : entry.prototypeId,
      labelKey: entry.labelKey,
      path: listVariant ? entry.listPath : entry.path,
    })),
  };
}

/** Admin-only M2.1 checkpoint. Later approved batches append sibling categories. */
export const ADMIN_MASTERS_NAV = [
  {
    id: 'masters',
    labelKey: 'masters.title',
    path: paths.masters.root,
    icon: 'layers',
    megaMenu: true,
    children: [adminCategory(false)],
  },
  {
    id: 'masters-list',
    labelKey: 'masters.listTitle',
    path: paths.mastersList.root,
    icon: 'grid',
    firstLeafRoute: true,
    hideInTopNav: true,
    children: [adminCategory(true)],
  },
] as const satisfies readonly NavNode[];
