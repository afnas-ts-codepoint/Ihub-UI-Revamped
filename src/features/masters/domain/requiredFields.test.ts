import { describe, expect, it } from 'vitest';

import { EMPTY_MASTER_FORM } from './formValues';
import { masterFormMissing, REQUIRED_FIELDS } from './requiredFields';

const complete = {
  ...EMPTY_MASTER_FORM,
  area: 'Area',
  areas: ['Area'],
  assignmentArea: 'Assignment',
  dept: 'Department',
  location: 'Location',
  locations: ['Location'],
  name: 'Name',
  subAreas: ['Sub'],
  zone: 'Zone',
  zones: ['Zone'],
};

describe('masterFormMissing golden parity', () => {
  const modes = ['pc', 'aa', 'tm', 'sa', 'generic'] as const;

  it.each(modes)('%s accepts its complete fixture', (mode) => {
    expect(masterFormMissing(complete, mode)).toBe(false);
  });

  for (const mode of modes) {
    it.each(REQUIRED_FIELDS[mode])(`${mode} rejects missing %s`, (field) => {
      const value = Array.isArray(complete[field]) ? [] : '';
      expect(masterFormMissing({ ...complete, [field]: value }, mode)).toBe(true);
    });
  }

  it('matches empty-string, whitespace, null-like and combined missing behavior', () => {
    expect(masterFormMissing({ ...complete, name: '   ' }, 'pc')).toBe(true);
    expect(masterFormMissing({ ...complete, name: undefined }, 'pc')).toBe(true);
    expect(masterFormMissing({ ...complete, location: '', zone: '' }, 'aa')).toBe(true);
  });

  it('does not require optional fields in any mode', () => {
    for (const mode of modes) {
      expect(masterFormMissing({ ...complete, kpi: '', severity: '' }, mode)).toBe(false);
    }
  });
});
