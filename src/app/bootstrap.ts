import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { directionForLocale } from '@/shared/i18n/useDirection';
import { usePreferencesStore } from '@/store/preferences.store';

function applyDocumentPreferences() {
  const { locale, theme } = usePreferencesStore.getState();
  const root = document.documentElement;

  root.lang = locale;
  root.dir = directionForLocale(locale);
  root.dataset.theme = theme;
}

export async function bootstrap() {
  if (import.meta.env.DEV) {
    const { developmentLocaleMarker, getDevelopmentLocale } =
      await import('@/app/dev-locale');
    const locale = getDevelopmentLocale(window.location.search);

    document.documentElement.dataset.devLocale = developmentLocaleMarker;

    if (locale) {
      usePreferencesStore.getState().setLocale(locale);
    }
  }

  applyDocumentPreferences();
  await initializeI18n(usePreferencesStore.getState().locale);

  return usePreferencesStore.subscribe(({ locale }) => {
    applyDocumentPreferences();
    void i18n.changeLanguage(locale);
  });
}
