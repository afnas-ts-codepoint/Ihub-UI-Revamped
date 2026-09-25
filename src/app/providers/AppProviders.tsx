import { Direction } from 'radix-ui';
import type { PropsWithChildren } from 'react';

import { directionForLocale } from '@/shared/i18n/useDirection';
import { Toaster } from '@/shared/ui/feedback/Toaster';
import { usePreferencesStore } from '@/store/preferences.store';

/** Radix direction follows the single persisted locale preference. */
export function AppProviders({ children }: PropsWithChildren) {
  const locale = usePreferencesStore((state) => state.locale);

  return (
    <Direction.Provider dir={directionForLocale(locale)}>
      {children}
      <Toaster />
    </Direction.Provider>
  );
}
