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

export function viteBasePath(value: unknown) {
  const normalized = normalizeBasePath(value);
  return normalized === '/' ? normalized : `${normalized}/`;
}
