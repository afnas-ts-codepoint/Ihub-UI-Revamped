import { beforeAll, describe, expect, it } from 'vitest';

import fixture from '../../../../../scripts/golden/nav-search.fixture.json';
import { initializeI18n } from '@/shared/i18n/i18n';

import { navSearch } from './navSearch';
import { createNavSearchIndex } from './navSearchIndex';

beforeAll(async () => {
  await initializeI18n('en');
});

describe('navSearch golden parity', () => {
  it('matches the prototype ordered results for the EN/AR corpus', () => {
    const index = createNavSearchIndex();

    expect(fixture.baseline).toBe('273abc8');
    expect(fixture.cases).toHaveLength(48);
    expect(fixture.cases.filter(({ locale }) => locale === 'en')).toHaveLength(
      24,
    );
    expect(fixture.cases.filter(({ locale }) => locale === 'ar')).toHaveLength(
      24,
    );

    for (const goldenCase of fixture.cases) {
      expect(
        navSearch(index, goldenCase.query).map((entry) => entry.key),
        `${goldenCase.locale}:${goldenCase.query}`,
      ).toEqual(goldenCase.resultKeys);
    }
  });

  it('returns no more than the prototype maximum of 12 results', () => {
    expect(navSearch(createNavSearchIndex(), 'a')).toHaveLength(12);
  });
});
