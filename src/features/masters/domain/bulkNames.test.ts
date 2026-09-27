import { describe, expect, it } from 'vitest';

import {
  cleanBulkNames,
  mergeBulkNames,
  namesFromDelimitedText,
  namesFromSpreadsheet,
} from './bulkNames';

describe('bulkNames prototype parity', () => {
  it('flattens every CSV comma, semicolon and line-delimited value', () => {
    expect(namesFromDelimitedText('Name,Extra\r\n"Alpha";Beta\nGamma')).toEqual([
      'Name',
      'Extra',
      'Alpha',
      'Beta',
      'Gamma',
    ]);
  });

  it('takes only the first spreadsheet column and ignores extra columns', () => {
    expect(namesFromSpreadsheet([
      ['Name', 'Ignored'],
      ['Alpha', 'Also ignored'],
      [],
      ['Beta'],
    ])).toEqual(['Name', 'Alpha', '', 'Beta']);
  });

  it.each([
    ['projectCategory' as const, ['  PROJECT CATEGORY MASTER  ', ' Alpha ', '', '  ', 'Beta'], ['Alpha', 'Beta']],
    ['projectCategory' as const, ['Alpha', 'Name', 'Beta'], ['Alpha', 'Name', 'Beta']],
    ['subArea' as const, ['  SuBaReAs ', ' Alpha ', null, 'Beta'], ['Alpha', 'Beta']],
    ['subArea' as const, ['Unknown header', ' Alpha '], ['Unknown header', 'Alpha']],
  ])('trims, drops blanks and strips only a recognized first %s header', (kind, values, expected) => {
    expect(cleanBulkNames(values, kind)).toEqual(expected);
  });

  it('preserves internal spaces, duplicate case and import count candidates', () => {
    expect(cleanBulkNames(['Name', 'Alpha  Beta', 'alpha', 'Alpha'], 'projectCategory')).toEqual([
      'Alpha  Beta',
      'alpha',
      'Alpha',
    ]);
  });

  it('keeps editable rows first and stably de-duplicates exact values only', () => {
    expect(mergeBulkNames(
      [' Existing ', '', 'Alpha', 'alpha'],
      ['Alpha', 'Beta', 'alpha', 'Beta', ' Existing '],
    )).toEqual([' Existing ', 'Alpha', 'alpha', 'Beta']);
  });
});
