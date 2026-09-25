import { isLocale, type Locale } from '@/shared/i18n/i18n';

export const developmentLocaleMarker = 'ihub-dev-lng-switch';

export function getDevelopmentLocale(search: string): Locale | undefined {
  const locale = new URLSearchParams(search).get('lng');

  return isLocale(locale) ? locale : undefined;
}
