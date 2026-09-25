export type RouterMode = 'browser' | 'hash';

export type AppEnvironment = {
  basePath: string;
  routerMode: RouterMode;
};

type EnvironmentSource = {
  VITE_BASE_PATH?: unknown;
  VITE_ROUTER_MODE?: unknown;
};

export function normalizeBasePath(value: unknown) {
  if (typeof value !== 'string') {
    return '/';
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === '/' || /[?#]/.test(trimmed)) {
    return '/';
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/')}`;
}

export function readEnvironment(source: EnvironmentSource): AppEnvironment {
  return {
    basePath: normalizeBasePath(source.VITE_BASE_PATH),
    routerMode: source.VITE_ROUTER_MODE === 'hash' ? 'hash' : 'browser',
  };
}

export const env = readEnvironment(import.meta.env);
