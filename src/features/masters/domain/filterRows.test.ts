import { describe, expect, it } from 'vitest';

import { filterMasterRows, isInertFilterField } from './filterRows';
import type { MasterRow } from './types';

const row = (overrides: Partial<MasterRow>): MasterRow => ({
  code: 'X-1',
  name: 'Alpha',
  status: 'active',
  ...overrides,
});

describe('filterMasterRows', () => {
  it('filters by the status chip', () => {
    const rows = [
      row({ code: 'a', status: 'active' }),
      row({ code: 'b', status: 'inactive' }),
    ];
    expect(
      filterMasterRows(rows, 'generic', {
        filters: {},
        search: '',
        status: 'active',
      }),
    ).toEqual([rows[0]]);
    expect(
      filterMasterRows(rows, 'generic', {
        filters: {},
        search: '',
        status: 'all',
      }),
    ).toHaveLength(2);
  });

  it('searches only the name field, case-insensitively, with partial match', () => {
    const rows = [
      row({ code: 'a', name: 'Consumables' }),
      row({ code: 'b', name: 'Spare Parts' }),
    ];
    expect(
      filterMasterRows(rows, 'pc', {
        filters: {},
        search: 'consum',
        status: 'all',
      }),
    ).toEqual([rows[0]]);
    expect(
      filterMasterRows(rows, 'pc', {
        filters: {},
        search: 'CONSUM',
        status: 'all',
      }),
    ).toEqual([rows[0]]);
  });

  it('treats a whitespace-only search as matching everything, matching the prototype', () => {
    const rows = [row({ code: 'a', name: 'Consumables' })];
    expect(
      filterMasterRows(rows, 'pc', {
        filters: {},
        search: '   ',
        status: 'all',
      }),
    ).toEqual(rows);
  });

  it('returns no rows when search matches nothing', () => {
    const rows = [row({ code: 'a', name: 'Consumables' })];
    expect(
      filterMasterRows(rows, 'pc', {
        filters: {},
        search: 'zzz',
        status: 'all',
      }),
    ).toEqual([]);
  });

  it('applies the PC name filter only in pc mode', () => {
    const rows = [
      row({ code: 'a', name: 'Consumables' }),
      row({ code: 'b', name: 'Spare Parts' }),
    ];
    expect(
      filterMasterRows(rows, 'pc', {
        filters: { name: 'consum' },
        search: '',
        status: 'all',
      }),
    ).toEqual([rows[0]]);
    // The same field is ignored outside pc mode.
    expect(
      filterMasterRows(rows, 'generic', {
        filters: { name: 'consum' },
        search: '',
        status: 'all',
      }),
    ).toHaveLength(2);
  });

  it('applies the date range only in pc/aa/tm/sa modes', () => {
    const rows = [
      row({ code: 'a', createdOn: '2026-01-01' }),
      row({ code: 'b', createdOn: '2026-06-01' }),
    ];
    const params = {
      filters: { fromDate: '2026-03-01' },
      search: '',
      status: 'all' as const,
    };
    expect(filterMasterRows(rows, 'aa', params)).toEqual([rows[1]]);
    expect(filterMasterRows(rows, 'generic', params)).toHaveLength(2);
  });

  it('narrows Assignment Areas by location and zone', () => {
    const rows = [
      row({ code: 'a', location: 'A', zone: 'Z1' }),
      row({ code: 'b', location: 'A', zone: 'Z2' }),
      row({ code: 'c', location: 'B', zone: 'Z1' }),
    ];
    expect(
      filterMasterRows(rows, 'aa', {
        filters: { locations: 'A', zones: 'Z1' },
        search: '',
        status: 'all',
      }),
    ).toEqual([rows[0]]);
  });

  it('narrows Sub Area by assignment area and sub-area name', () => {
    const rows = [
      row({
        assignmentArea: 'Facility Maintenance',
        code: 'a',
        name: 'Restrooms',
      }),
      row({
        assignmentArea: 'Facility Maintenance',
        code: 'b',
        name: 'Corridors',
      }),
    ];
    expect(
      filterMasterRows(rows, 'sa', {
        filters: { subAreaName: 'Corridors' },
        search: '',
        status: 'all',
      }),
    ).toEqual([rows[1]]);
  });

  it('narrows Task Mapping by area/subArea/touchPoint/dept/applicableFor', () => {
    const rows = [
      row({
        applicableFor: 'Price range',
        area: 'Main Rides',
        code: 'a',
        dept: 'Operations Department',
        subArea: 'Roller Coaster Zone',
        touchPoint: 'Ticket Counter',
      }),
      row({
        applicableFor: 'Promo discussion',
        area: 'Grand Avenue',
        code: 'b',
        dept: 'Safety Department',
        subArea: 'North Wing',
        touchPoint: 'Guest Entry Point',
      }),
    ];
    expect(
      filterMasterRows(rows, 'tm', {
        filters: { dept: 'Safety Department' },
        search: '',
        status: 'all',
      }),
    ).toEqual([rows[1]]);
  });

  it("leaves the generic mode's location/zone/audit fields inert (no row predicate)", () => {
    const rows = [
      row({ code: 'a', dept: 'Ops' }),
      row({ code: 'b', dept: 'Safety' }),
    ];
    const filters = {
      createdBy: 'Ahmad Al-Sabah',
      createdOn: '2026-01-01',
      locations: 'Al Kout Mall',
      updatedBy: 'System Admin',
      updatedOn: '2026-02-02',
      zones: 'Zone A',
    };
    expect(
      filterMasterRows(rows, 'generic', { filters, search: '', status: 'all' }),
    ).toHaveLength(2);
  });

  it('flags exactly the generic-mode fields the row filter never applies', () => {
    for (const id of [
      'locations',
      'zones',
      'createdOn',
      'updatedOn',
      'createdBy',
      'updatedBy',
    ]) {
      expect(isInertFilterField('generic', id)).toBe(true);
    }
    expect(isInertFilterField('generic', 'status')).toBe(false);
    expect(isInertFilterField('pc', 'locations')).toBe(false);
  });
});
