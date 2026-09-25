import { describe, expect, it } from 'vitest';

import { navFirstLeaf, navIsAncestor, navPath } from '@/app/navigation/model';
import { ADMIN_MASTERS_NAV } from '@/app/navigation/nav.config';
import { ADMIN_MASTER_CATALOG } from '@/features/masters';

describe('Admin masters navigation checkpoint', () => {
  it('covers every approved Admin entry in both prototype navigation variants', () => {
    const [masters, mastersList] = ADMIN_MASTERS_NAV;

    expect(masters.children[0].children).toHaveLength(27);
    expect(mastersList.children[0].children).toHaveLength(27);

    for (const entry of ADMIN_MASTER_CATALOG) {
      expect(navPath(ADMIN_MASTERS_NAV, entry.prototypeId)).toEqual([
        'masters',
        'masters/admin',
        entry.prototypeId,
      ]);
      expect(navPath(ADMIN_MASTERS_NAV, entry.prototypeListId)).toEqual([
        'masters-list',
        'masters-list/admin',
        entry.prototypeListId,
      ]);
    }
  });

  it('matches prototype first-leaf and ancestor behavior', () => {
    const masters = ADMIN_MASTERS_NAV[0];
    const mastersList = ADMIN_MASTERS_NAV[1];

    expect(navFirstLeaf(masters).id).toBe(
      'masters/admin/project-category-master',
    );
    expect(navFirstLeaf(mastersList).id).toBe(
      'masters-list/admin/project-category-master',
    );
    expect(navIsAncestor(masters, 'masters/admin/users')).toBe(true);
    expect(navIsAncestor(masters, 'masters-list/admin/users')).toBe(false);
  });
});
