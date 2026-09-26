import { createInstance } from 'i18next';
import type { BackendModule, ReadCallback } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const supportedLocales = ['en', 'ar'] as const;
export type Locale = (typeof supportedLocales)[number];

type TranslationModule = {
  default: Record<string, unknown>;
};

const resourceLoaders = import.meta.glob<TranslationModule>(
  './locales/*/*.json',
);

const lazyNamespaceBackend: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read(language: string, namespace: string, callback: ReadCallback) {
    const loader = resourceLoaders[`./locales/${language}/${namespace}.json`];

    if (!loader) {
      callback(
        new Error(`Missing i18n resource: ${language}/${namespace}`),
        false,
      );
      return;
    }

    void loader().then(
      (module) => {
        callback(null, module.default);
      },
      (error: unknown) => {
        callback(
          error instanceof Error
            ? error
            : new Error('Unable to load i18n resource'),
          false,
        );
      },
    );
  },
};

export const i18n = createInstance();
i18n.use(lazyNamespaceBackend).use(initReactI18next);

export function isLocale(value: unknown): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function normalizeLocale(value: string | undefined): Locale {
  return value?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export async function initializeI18n(locale: Locale) {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(locale);
    return i18n;
  }

  await i18n.init({
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    lng: locale,
    ns: ['appraisal', 'common', 'hr', 'nav', 'organization', 'reports'],
    preload: supportedLocales,
    react: { useSuspense: false },
    supportedLngs: supportedLocales,
  });

  return i18n;
}
