import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  preferencesStorageKey,
  usePreferencesStore,
} from '@/store/preferences.store';

beforeEach(() => {
  localStorage.clear();
  usePreferencesStore.setState({ locale: 'en', theme: 'paper' });
});

describe('preferences store', () => {
  it('persists theme and locale under the approved key', async () => {
    usePreferencesStore.getState().setLocale('ar');
    usePreferencesStore.getState().setTheme('ink');
    const persisted = localStorage.getItem(preferencesStorageKey);

    expect(persisted).toContain('"locale":"ar"');
    expect(persisted).toContain('"theme":"ink"');

    usePreferencesStore.setState({ locale: 'en', theme: 'paper' });
    localStorage.setItem(preferencesStorageKey, persisted ?? '');
    await usePreferencesStore.persist.rehydrate();

    expect(usePreferencesStore.getState()).toMatchObject({
      locale: 'ar',
      theme: 'ink',
    });
  });

  it('continues in memory when storage throws', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Unavailable');
      });

    expect(() => {
      usePreferencesStore.getState().setTheme('ink');
    }).not.toThrow();
    expect(usePreferencesStore.getState().theme).toBe('ink');

    setItem.mockRestore();
  });
});
