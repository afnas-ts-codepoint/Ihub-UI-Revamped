import { describe, expect, it } from 'vitest';

import { navFirstLeaf, navIsAncestor, navPath } from '@/app/navigation/model';
import { MASTERS_NAV } from '@/app/navigation/nav.config';
import { MASTER_CATALOG } from '@/features/masters';

describe('complete Masters catalogue navigation', () => {
  it('covers all 80 entries in both prototype navigation variants', () => {
    const [masters, mastersList] = MASTERS_NAV;

    expect(masters.children[0].children).toHaveLength(27);
    expect(masters.children[1].children).toHaveLength(22);
    expect(masters.children[2].children).toHaveLength(16);
    expect(masters.children[3].children).toHaveLength(15);
    expect(mastersList.children[0].children).toHaveLength(27);
    expect(mastersList.children[1].children).toHaveLength(22);
    expect(mastersList.children[2].children).toHaveLength(16);
    expect(mastersList.children[3].children).toHaveLength(15);

    for (const entry of MASTER_CATALOG) {
      expect(navPath(MASTERS_NAV, entry.prototypeId)).toEqual([
        'masters',
        `masters/${entry.category}`,
        entry.prototypeId,
      ]);
      expect(navPath(MASTERS_NAV, entry.prototypeListId)).toEqual([
        'masters-list',
        `masters-list/${entry.category}`,
        entry.prototypeListId,
      ]);
    }
  });

  it('matches prototype first-leaf and ancestor behavior', () => {
    const masters = MASTERS_NAV[0];
    const mastersList = MASTERS_NAV[1];

    expect(navFirstLeaf(masters).id).toBe(
      'masters/admin/project-category-master',
    );
    expect(navFirstLeaf(mastersList).id).toBe(
      'masters-list/admin/project-category-master',
    );
    expect(navIsAncestor(masters, 'masters/admin/users')).toBe(true);
    expect(navFirstLeaf(masters.children[1]).id).toBe(
      'masters/general/machine-master',
    );
    expect(navIsAncestor(masters, 'masters/general/zones')).toBe(true);
    expect(navFirstLeaf(masters.children[2]).id).toBe(
      'masters/hr/appraisal-deduction',
    );
    expect(navFirstLeaf(masters.children[3]).id).toBe(
      'masters/operation/assignment-areas',
    );
    expect(navIsAncestor(masters, 'masters/hr/employees')).toBe(true);
    expect(navIsAncestor(masters, 'masters/operation/item-unit')).toBe(true);
    expect(navIsAncestor(masters, 'masters-list/admin/users')).toBe(false);
  });
});
