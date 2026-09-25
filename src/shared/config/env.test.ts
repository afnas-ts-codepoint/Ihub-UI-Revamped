import { describe, expect, it } from 'vitest';

import { normalizeBasePath, readEnvironment } from '@/shared/config/env';

describe('environment configuration', () => {
  it('normalizes the current router settings', () => {
    expect(
      readEnvironment({
        VITE_BASE_PATH: 'portal//app/',
        VITE_ROUTER_MODE: 'hash',
      }),
    ).toEqual({ basePath: '/portal/app', routerMode: 'hash' });
  });

  it('uses production-safe defaults for invalid values', () => {
    expect(readEnvironment({ VITE_ROUTER_MODE: 'invalid' })).toEqual({
      basePath: '/',
      routerMode: 'browser',
    });
    expect(normalizeBasePath('/unsafe?query=true')).toBe('/');
  });
});
