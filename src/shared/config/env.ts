import { normalizeBasePath } from '@/shared/config/basePath';

export { normalizeBasePath } from '@/shared/config/basePath';

export type RouterMode = 'browser' | 'hash';

export type AppEnvironment = {
  basePath: string;
  routerMode: RouterMode;
};

type EnvironmentSource = {
  VITE_BASE_PATH?: unknown;
  VITE_ROUTER_MODE?: unknown;
};

export function readEnvironment(source: EnvironmentSource): AppEnvironment {
  return {
    basePath: normalizeBasePath(source.VITE_BASE_PATH),
    routerMode: source.VITE_ROUTER_MODE === 'hash' ? 'hash' : 'browser',
  };
}

export const env = readEnvironment(import.meta.env);
