import { useTranslation } from 'react-i18next';

import { formatProfileClock } from '@/shared/i18n/format';
import { i18n } from '@/shared/i18n/i18n';
import { Icon } from '@/shared/ui/icon/Icon';
import { ProgressRing } from '@/shared/ui/progress/ProgressRing';

import type { HomeProfile } from '../../types/home.types';

type ProfileClockProps = Readonly<{
  name: string;
  now: Date;
  profile: HomeProfile;
}>;

export function ProfileClock({ name, now, profile }: ProfileClockProps) {
  const { t } = useTranslation('home');
  const locale = i18n.resolvedLanguage === 'ar' ? 'ar' : 'en';

  return (
    <div className="flex h-full flex-col">
      <div className="mb-[7px] flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-[0.14em] text-fg-3 uppercase">
            {t('profile.label')}
          </div>
          <div className="display mt-1.5 text-7xl leading-[1.1] font-medium">
            {name}
          </div>
          <div className="mt-0 text-base leading-[1.55] text-fg-3">
            {profile.role}
          </div>
        </div>
        <ProgressRing
          label={`${String(Math.round(profile.completion * 100))}%`}
          size={64}
          stroke={6}
          value={profile.completion}
        />
      </div>
      <div className="text-base leading-[1.55] text-fg-3">
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-accent uppercase">
          <Icon className="-translate-y-px shrink-0" name="users" size={14} />
          {t('profile.delegatedUsers')}
        </div>
        <div className="mt-1.5 flex flex-col gap-1">
          {profile.delegates.map((delegate) => (
            <div key={delegate.name}>
              <span className="font-semibold text-fg">{delegate.name}</span>
              <span>{` - ${delegate.title}`}</span>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1.5">
            <Icon className="-translate-y-px shrink-0 text-fg-4" name="calendar" size={13} />
            <span>{t('profile.till')}</span>
            <span className="font-semibold text-fg">{profile.delegationTill}</span>
          </div>
        </div>
      </div>
      <hr className="my-2 mt-auto border-0 border-t border-line" />
      <time
        className="display num text-12xl font-medium tracking-[-0.03em]"
        dateTime={now.toISOString()}
      >
        {formatProfileClock(now, locale)}
      </time>
      <div className="text-sm tracking-[0.14em] text-fg-3 uppercase">
        {t('profile.timeZone')}
      </div>
    </div>
  );
}
