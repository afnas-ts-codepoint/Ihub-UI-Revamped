import { describe, expect, it } from 'vitest';

import { createEmptyRecordFilter } from '@/features/organization';

import { missingDocumentRows, purchaseHistoryRows, purchaseRequestRows } from '../data/purchasing.mock';
import { pcMatchRow, pcRowsF } from './pcMatchRow';

describe('pcMatchRow', () => {
  it('matches with an empty filter', () => {
    const filter = createEmptyRecordFilter();
    expect(pcRowsF(purchaseRequestRows, filter)).toHaveLength(purchaseRequestRows.length);
  });

  it('matches the search term case-insensitively across id/title/vendor/dept/status', () => {
    const filter = { ...createEmptyRecordFilter(), num: 'nasim facility' };
    expect(pcRowsF(purchaseRequestRows, filter).map((row) => row.id)).toEqual(['PC-2025-088']);
  });

  it('trims whitespace around the search term', () => {
    const filter = { ...createEmptyRecordFilter(), num: '  cleaning services  ' };
    expect(pcRowsF(purchaseRequestRows, filter).map((row) => row.id)).toEqual(['PC-2025-088']);
  });

  it('matches on punctuation-bearing ids exactly', () => {
    const filter = { ...createEmptyRecordFilter(), num: 'PC-2025-088' };
    expect(pcRowsF(purchaseRequestRows, filter).map((row) => row.id)).toEqual(['PC-2025-088']);
  });

  it('excludes rows that do not contain the search term', () => {
    const filter = { ...createEmptyRecordFilter(), num: 'does-not-exist' };
    expect(pcRowsF(purchaseRequestRows, filter)).toHaveLength(0);
  });

  it('matches dept by exact value, not substring', () => {
    const filter = { ...createEmptyRecordFilter(), dept: 'IT' };
    expect(pcRowsF(purchaseRequestRows, filter).map((row) => row.id)).toEqual(['PC-2025-087']);
  });

  it('matches status by exact value', () => {
    const filter = { ...createEmptyRecordFilter(), status: 'Approved' };
    expect(pcRowsF(purchaseRequestRows, filter).map((row) => row.id).sort()).toEqual(['PC-2025-085', 'PC-2025-086']);
  });

  it('lets a row with no dept field pass department filtering regardless of the filter value', () => {
    // Guard clause read literally from index.html:L10207 — `if (f.dept && r.dept && r.dept !== f.dept) return false;`
    // both f.dept and r.dept must be truthy for the filter to apply.
    const filter = { ...createEmptyRecordFilter(), dept: 'IT' };
    expect(pcRowsF(missingDocumentRows, filter)).toHaveLength(missingDocumentRows.length);
  });

  it('lets a row with no status field pass status filtering regardless of the filter value', () => {
    const filter = { ...createEmptyRecordFilter(), status: 'Approved' };
    expect(pcRowsF(missingDocumentRows, filter)).toHaveLength(missingDocumentRows.length);
  });

  it('matches history rows via the action/by/note-adjacent shared fields', () => {
    const filter = { ...createEmptyRecordFilter(), num: 'M. Faris' };
    expect(pcRowsF(purchaseHistoryRows, filter).map((row) => row.id)).toEqual(['PC-2025-088']);
  });

  it('combines the search term with dept and status filters', () => {
    const filter = { ...createEmptyRecordFilter(), dept: 'Procurement', num: 'cleaning', status: 'Pending CEO' };
    const [firstRequest] = purchaseRequestRows;
    expect(firstRequest).toBeDefined();
    expect(pcMatchRow(firstRequest as (typeof purchaseRequestRows)[number], filter)).toBe(true);
    expect(pcMatchRow({ ...(firstRequest as (typeof purchaseRequestRows)[number]), dept: 'IT' }, filter)).toBe(false);
  });

  it('treats a missing field as absent in the search haystack', () => {
    const filter = { ...createEmptyRecordFilter(), num: 'security cameras' };
    const secondMissingRow = missingDocumentRows.find((row) => row.id === 'PC-2025-084');
    expect(secondMissingRow).toBeDefined();
    expect(pcMatchRow(secondMissingRow as (typeof missingDocumentRows)[number], filter)).toBe(true);
    expect(
      pcMatchRow(secondMissingRow as (typeof missingDocumentRows)[number], { ...createEmptyRecordFilter(), num: 'vendor-only-field-that-does-not-exist' }),
    ).toBe(false);
  });
});
