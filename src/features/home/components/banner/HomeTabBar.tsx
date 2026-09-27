import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';

import { HOME_TABS } from '../../constants/homeTabs';
import type { HomeCounts, HomeTabId } from '../../types/home.types';

type HomeTabBarProps = Readonly<{
  activeTab: HomeTabId | null;
  counts: HomeCounts;
  onSelect: (path: string) => void;
}>;

/** @prototype index.html:L12521-L12574. */
export function HomeTabBar({ activeTab, counts, onSelect }: HomeTabBarProps) {
  const { t } = useTranslation('home');

  return (
    <nav
      aria-label={t('tabs.label')}
      className="sticky top-[65px] z-25 -mt-1 flex scrollbar-none gap-1 overflow-x-auto border-b border-line bg-canvas/90 backdrop-blur-sm"
      data-testid="home-tab-bar"
    >
      {HOME_TABS.map((tab) => {
        const active = activeTab === tab.id;
        const count =
          tab.id === 'assigned'
            ? counts.assigned
            : tab.id === 'incidents'
              ? counts.incidents
              : undefined;

        return (
          <button
            aria-current={active ? 'page' : undefined}
            className="-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 pt-[13px] pb-3 text-md font-medium whitespace-nowrap data-[active=false]:border-transparent data-[active=false]:text-fg-3 data-[active=true]:border-accent data-[active=true]:font-semibold data-[active=true]:text-fg"
            data-active={active}
            key={tab.id}
            onClick={() => {
              onSelect(tab.path);
            }}
            type="button"
          >
            <Icon
              className={active ? 'text-accent' : 'text-fg-4'}
              name={tab.icon}
              size={16}
            />
            {t(tab.labelKey)}
            {count && count > 0 ? (
              <span
                className="num rounded-full px-[7px] py-px text-xs font-semibold data-[active=false]:bg-inset data-[active=false]:text-fg-3 data-[active=true]:bg-accent-dim data-[active=true]:text-accent"
                data-active={active}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
