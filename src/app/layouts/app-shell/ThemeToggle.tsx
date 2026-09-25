import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';
import { usePreferencesStore } from '@/store/preferences.store';

/** @prototype index.html:L3336-L3345 ThemeToggle */
export function ThemeToggle() {
  const { t } = useTranslation('common');
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const isInk = theme === 'ink';
  const label = t(isInk ? 'topBar.theme.light' : 'topBar.theme.dark');

  return (
    <button
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-2 hover:bg-inset hover:text-fg"
      onClick={() => {
        setTheme(isInk ? 'paper' : 'ink');
      }}
      title={label}
      type="button"
    >
      <Icon name={isInk ? 'sun' : 'moon'} size={18} />
    </button>
  );
}
