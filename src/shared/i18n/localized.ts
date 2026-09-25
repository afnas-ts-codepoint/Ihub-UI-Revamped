import { useTranslation } from 'react-i18next';

import { normalizeLocale, type Locale } from '@/shared/i18n/i18n';

export type LocalizedText = Readonly<Record<Locale, string>>;

export function getLocalizedText(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export function useLocalizedText() {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);

  return (value: LocalizedText) => getLocalizedText(value, locale);
}
