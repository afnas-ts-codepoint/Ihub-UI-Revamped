import { describe, expect, it } from 'vitest';

import { defaultHomePurchasingSection, isHomePurchasingSection } from './homePurchasing';

describe('Home purchasing domain', () => {
  it('validates the exact route sections and defaults to create', () => {
    expect(defaultHomePurchasingSection).toBe('create');
    expect(
      [
        'create',
        'pending',
        'edit',
        'review',
        'po',
        'quotations',
        'todo',
        'missing',
        'history',
        'report',
      ].every(isHomePurchasingSection),
    ).toBe(true);
    expect(isHomePurchasingSection('supplier-quotations')).toBe(false);
    expect(isHomePurchasingSection(undefined)).toBe(false);
  });
});
