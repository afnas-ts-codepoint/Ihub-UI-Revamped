import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { bootstrap } from '@/app/bootstrap';
import { i18n } from '@/shared/i18n/i18n';
import { usePreferencesStore } from '@/store/preferences.store';

let stop: (() => void) | undefined;

beforeEach(() => {
  localStorage.clear();
  usePreferencesStore.setState({ locale: 'en', theme: 'paper' });
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  stop?.();
  stop = undefined;
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('dir');
  document.documentElement.removeAttribute('lang');
  window.history.replaceState({}, '', '/');
});

describe('bootstrap', () => {
  it('applies and synchronizes locale, direction, and theme without reload', async () => {
    stop = await bootstrap();

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(document.documentElement).toHaveAttribute('data-theme', 'paper');

    usePreferencesStore.getState().setLocale('ar');
    usePreferencesStore.getState().setTheme('ink');

    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('data-theme', 'ink');
    await waitFor(() => {
      expect(i18n.language).toBe('ar');
    });
  });

  it('honors the development-only lng query parameter', async () => {
    window.history.replaceState({}, '', '/?lng=ar');
    stop = await bootstrap();

    expect(usePreferencesStore.getState().locale).toBe('ar');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  });
});
