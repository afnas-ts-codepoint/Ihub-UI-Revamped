import { describe, expect, it } from 'vitest';

import { masterFormDraft, masterFormOutput, splitMasterMultiValue } from './formValues';
import { AA_AREA_ROWS, MASTER_MOCK_ROWS, PC_CATEGORY_ROWS, SA_SUB_ROWS, TM_MAP_ROWS } from '../data/seedRows';

describe('master form edit transforms', () => {
  it('preserves the prototype comma-split trimming and empty-value removal', () => {
    expect(splitMasterMultiValue(' Finance,  Operations ,, HR ')).toEqual([
      'Finance',
      'Operations',
      'HR',
    ]);
    expect(splitMasterMultiValue(undefined)).toEqual([]);
    expect(splitMasterMultiValue(['Finance', 'HR'])).toEqual(['Finance', 'HR']);
  });

  it('flattens Task Mapping row strings into edit chip arrays', () => {
    const row = TM_MAP_ROWS[0];
    if (!row) throw new Error('Expected Task Mapping fixture');
    const draft = masterFormDraft(row, 'tm');
    expect(draft.locations).toEqual(['360 MALL']);
    expect(draft.areas).toEqual(['Main Rides']);
    expect(draft.matrixList).toEqual(['Finance', 'Operations']);
  });

  it('joins Task Mapping chips and uses the first area as the saved name', () => {
    const row = TM_MAP_ROWS[0];
    if (!row) throw new Error('Expected Task Mapping fixture');
    const draft = masterFormDraft(row, 'tm');
    const output = masterFormOutput(row, {
      ...draft,
      areas: ['Food Court', 'Kids Zone'],
      locations: ['360 MALL', 'Offsite'],
      matrixList: ['HR', 'Finance'],
    }, 'tm');
    expect(output.area).toBe('Food Court, Kids Zone');
    expect(output.location).toBe('360 MALL, Offsite');
    expect(output.matrix).toBe('HR, Finance');
    expect(output.name).toBe('Food Court');
  });

  it.each([
    ['pc', PC_CATEGORY_ROWS[0]],
    ['aa', AA_AREA_ROWS[0]],
    ['sa', SA_SUB_ROWS[0]],
    ['generic', MASTER_MOCK_ROWS[0]],
  ] as const)('round-trips untouched %s edit values while preserving row identity', (mode, row) => {
    if (!row) throw new Error(`Expected ${mode} fixture`);
    const output = masterFormOutput(row, masterFormDraft(row, mode), mode);
    expect(output.code).toBe(row.code);
    expect(output.status).toBe(row.status);
    expect(output.name).toBe(row.name);
  });
});
