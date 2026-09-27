import { describe, expect, it } from 'vitest';

import { defaultHomePurchasingSection, isHomePurchasingSection } from './homePurchasing';

describe('Home purchasing domain', () => {
  it('validates the exact route sections and defaults to create', () => {
    expect(defaultHomePurchasingSection).toBe('create');
    expect(
      ['create', 'pending', 'edit', 'review', 'po', 'todo', 'missing', 'history', 'report'].every(
        isHomePurchasingSection,
      ),
    ).toBe(true);
    expect(isHomePurchasingSection('quotations')).toBe(false);
    expect(isHomePurchasingSection(undefined)).toBe(false);
  });
});
