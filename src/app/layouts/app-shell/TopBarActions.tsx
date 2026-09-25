import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { CommandSearch } from '@/app/layouts/app-shell/command-search/CommandSearch';
import { ThemeToggle } from '@/app/layouts/app-shell/ThemeToggle';
import { NotificationsMenu } from '@/features/notifications';
import { useCurrentUser } from '@/features/organization';
import { paths } from '@/shared/config/paths';
import { normalizeLocale } from '@/shared/i18n/i18n';
import { getLocalizedText } from '@/shared/i18n/localized';
import { Avatar } from '@/shared/ui/avatar/Avatar';
import { Icon } from '@/shared/ui/icon/Icon';
import { usePreferencesStore } from '@/store/preferences.store';

const actionClassName =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-2 hover:bg-inset hover:text-fg';

function LanguageSwitch() {
  const { i18n, t } = useTranslation('common');
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const setLocale = usePreferencesStore((state) => state.setLocale);
  const targetLocale = locale === 'en' ? 'ar' : 'en';
  const label = t(
    targetLocale === 'ar'
      ? 'topBar.language.switchToArabic'
      : 'topBar.language.switchToEnglish',
  );

  return (
    <button
      aria-label={label}
      className={`${actionClassName} text-xs font-semibold`}
      onClick={() => {
        setLocale(targetLocale);
      }}
      title={label}
      type="button"
    >
      {t(`topBar.language.${targetLocale}`)}
    </button>
  );
}

/** @prototype index.html:L3373-L3401 TopBarActions, plus approved D8. */
export function TopBarActions() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation('common');
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const currentUser = useCurrentUser();

  return (
    <div className="ms-auto flex shrink-0 items-center gap-2">
      <CommandSearch onSelect={(path) => void navigate(path)} />
      <ThemeToggle />
      <LanguageSwitch />
      <button
        aria-label={t('topBar.settings')}
        className={actionClassName}
        onClick={() => void navigate(paths.settings.configuration)}
        title={t('topBar.settings')}
        type="button"
      >
        <Icon name="settings" size={18} />
      </button>
      <NotificationsMenu onViewAll={() => void navigate(paths.notifications)} />
      <Avatar
        accessibleName={getLocalizedText(currentUser.data.name, locale)}
        name={currentUser.data.name.en}
        size={32}
      />
    </div>
  );
}
