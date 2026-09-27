import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useNow } from '@/shared/hooks/useNow';
import { Icon } from '@/shared/ui/icon/Icon';

import { HOME_TABS } from '../../constants/homeTabs';
import { useHomeBannerData } from '../../hooks/useHomeBannerData';
import { useHomeCounts } from '../../hooks/useHomeCounts';
import type { HomeTabId } from '../../types/home.types';
import { AiSubscriptionMenu } from './AiSubscriptionMenu';
import { HeroCarousel } from './HeroCarousel';
import { HomeTabBar } from './HomeTabBar';
import { ProfileClock } from './ProfileClock';
import { PulseStrip } from './PulseStrip';

type HomeTopBannerProps = Readonly<{
  activeTab: HomeTabId | null;
}>;

export function greetingKeyForHour(hour: number) {
  if (hour < 12) return 'greeting.morning' as const;
  if (hour < 18) return 'greeting.afternoon' as const;
  return 'greeting.evening' as const;
}

function longEnglishDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(value);
}

/** @prototype index.html:L14983-L15161. */
export function HomeTopBanner({ activeTab }: HomeTopBannerProps) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const now = useNow();
  const { data } = useHomeBannerData();
  const counts = useHomeCounts(data);
  const navigateToTab = (tab: HomeTabId) => {
    const destination = HOME_TABS.find((item) => item.id === tab);
    if (destination) void navigate(destination.path);
  };

  return (
    <div className="flex flex-col gap-6" data-testid="home-top-banner">
      <section className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-stretch gap-7 max-desktop:grid-cols-1">
        <div className="flex flex-col pt-6">
          <div className="mb-3.5 text-xs font-semibold tracking-[0.14em] text-fg-3 uppercase">
            {`${longEnglishDate(now)} · ${t('greeting.headOffice')}`}
          </div>
          <h1 className="display m-0 text-[clamp(36px,5.2vw,64px)] leading-[1.02] font-normal tracking-[-0.035em]">
            {`${t(greetingKeyForHour(now.getHours()))}, `}
            <em>{'Ahmad'}</em>
            {'.'}
          </h1>
          <blockquote className="mt-[22px] mb-0 max-w-[620px] border-s-[3px] border-accent ps-[18px]">
            <p className="m-0 font-serif text-4xl leading-[1.4] font-medium text-fg italic rtl:font-sans rtl:font-semibold rtl:not-italic">
              {t('greeting.quote')}
            </p>
            <footer className="mt-2.5 text-xs font-semibold tracking-[0.14em] text-fg-3 uppercase">
              {`— ${t('greeting.quoteBy')}`}
            </footer>
          </blockquote>
          <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-interactive px-3.5 py-2 text-base font-semibold text-accent-ink"
              data-prototype-noop="home-quick-actions"
              type="button"
            >
              <Icon name="inbox" size={14} />
              {t('actions.openInbox')}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-base font-semibold text-fg-2"
              data-prototype-noop="home-quick-actions"
              type="button"
            >
              <Icon name="bolt" size={14} />
              {t('actions.clockIn')}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-fg-2 hover:bg-raised"
              data-prototype-noop="home-quick-actions"
              type="button"
            >
              <Icon name="sparkle" size={14} />
              {t('actions.askIhub')}
            </button>
            <AiSubscriptionMenu />
          </div>
        </div>
        <HeroCarousel
          actions={data.actions}
          counts={counts}
          incidents={data.incidents}
        >
          <ProfileClock name={data.profile.name} now={now} profile={data.profile} />
        </HeroCarousel>
      </section>
      <PulseStrip counts={counts} onJump={navigateToTab} />
      <HomeTabBar
        activeTab={activeTab}
        counts={counts}
        onSelect={(path) => {
          void navigate(path);
        }}
      />
    </div>
  );
}
