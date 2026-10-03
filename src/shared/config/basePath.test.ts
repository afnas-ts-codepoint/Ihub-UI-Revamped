import { describe, expect, it } from 'vitest';

import { normalizeBasePath, viteBasePath } from './basePath';

describe('production base path', () => {
  it('normalizes the router basename without a trailing slash', () => {
    expect(normalizeBasePath(' portal//ihub/ ')).toBe('/portal/ihub');
    expect(normalizeBasePath('/')).toBe('/');
  });

  it('emits the same base with the trailing slash Vite requires for assets', () => {
    expect(viteBasePath(' portal//ihub/ ')).toBe('/portal/ihub/');
    expect(viteBasePath(undefined)).toBe('/');
  });

  it('rejects query and fragment syntax from both consumers', () => {
    expect(normalizeBasePath('/portal?preview=1')).toBe('/');
    expect(viteBasePath('/portal#preview')).toBe('/');
  });
});
