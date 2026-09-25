import { useTranslation } from 'react-i18next';

import { normalizeLocale, type Locale } from '@/shared/i18n/i18n';

export type Direction = 'ltr' | 'rtl';

export function directionForLocale(locale: Locale): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function useDirection(): Direction {
  const { i18n } = useTranslation();

  return directionForLocale(
    normalizeLocale(i18n.resolvedLanguage ?? i18n.language),
  );
}
